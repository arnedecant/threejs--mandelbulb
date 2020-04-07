// COPYRIGHT INFO MOVED TO THE END OF THE FILE AFTER SOURCE!
// Moved for the sake of editing convenience here:
// - http://www.kinostudios.com/mandelbulb.html

#define HALFPI 1.570796
#define PI 3.141592653

#define MIN_EPSILON 6e-7
#define MIN_NORM 1.5e-7

#define MAX_ITERATIONS 4
#define minRange 6e-5

// 10 - 200  "The maximum number of steps a ray should take."
#define STEP_LIMIT 110

// viewMatrix and cameraPosition are automatically included by THREE.js
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform float time;

uniform float power; //=8.0; //-20 -> 20 // Power of fractal
uniform bool phong;
uniform float shadows; //=0.0;
uniform float ambientOcclusion; //=0.9;
uniform float ambientOcclusionEmphasis; //=0.98; //"Emphasise the structure edges based on the number of steps it takes to reach a point in the fractal.";
uniform float bounding; //=1.5; //1->16 "Sets the bounding sphere radius to help accelerate the raytracing.";
uniform float bailout; //=2.0; //0.5->12 //"Sets the bailout value for the fractal calculation. Lower values give smoother less detailed results.";

uniform float colorSpread; //=0.2;
uniform float rimLight; //=0.0;
uniform float specularity; //=0.66;
uniform float specularExponent; //=15.0;

uniform vec4 backgroundColor; //=vec4(0.0, 0.0, 0.0, 1.0);
uniform vec4 diffuseColor; //=vec4(0.0, 0.85, 0.99, 1.0);
uniform vec4 ambientColor; //=vec4(0.67, 0.85, 1.0, 1.0);
uniform vec4 lightColor; //=vec4(0.48, 0.59, 0.66, 0.0);

uniform float epsilonScale; //=1.0; // 0 - 1  "Scale the epsilon step distance. Smaller values are slower but will generate smoother results for thin areas.";

varying vec3 rayDir;

float width=512.0;//=512;
float height=512.0;//=512;
float pixelSize=1.0;//width/height;//1.0;
int   antialiasing=1;//"Super sampling quality. Number of samples squared per pixel.";

vec3  light=vec3(38.0, -42.0, 38.0);

float phasex;
float phasey;

vec2 phase=vec2(phasex+time/16.0, phasey-time/16.0);

vec2 size = vec2(float(width), float(height));
float aspectRatio = size.x / size.y;

// vec3 eye = (modelMatrix * vec4(cameraPosition, 1)).xyz;
vec3 eye = cameraPosition;

// Super sampling
float sampleStep = 1.0 / float(antialiasing + 1);
float sampleContribution = 1.0 / pow(float(antialiasing + 1), 2.0);
float pixel_scale = 1.0 / max(size.x, size.y);


// FROM: http://www.fractalforums.com/index.php?topic=16793.msg64299#msg64299
float DE(vec3 z0, inout float min_dist){//MandelBulb by twinbee
    vec4 z = vec4(z0,1.0), c = z;
    float r = length(z.xyz),zr,theta,phi,p=power;//p is the power
    phi = atan(z.y, z.x) * p;// th = atan(z.y, z.x) + phase.x; ...and here
    theta = asin(z.z / r) * p;// ph = acos(z.z / r) + phase.y; add phase shifts here 
    min_dist = min(min_dist, r);
    for (int n = 0; n < MAX_ITERATIONS; n++) {
        zr = pow(r, p-1.0);
        z=zr*vec4(r*vec3(sin(theta)*vec2(cos(phi),sin(phi)),cos(theta)),z.w*p)+c; // this version was from the forums
        r = length(z.xyz);
        min_dist = min(min_dist, r);
        if (r > bailout) break;
        phi = (atan(z.y, z.x) + phase.x) * p;// th = atan(z.y, z.x) + phase.x; ...and here
        theta = (acos(z.z / r) + phase.y) * p;// ph = acos(z.z / r) + phase.y; add phase shifts here  
    }
    return 0.5 * log(r) * r / z.w;
}

bool intersectBoundingSphere(vec3 origin,
    vec3 direction,
    out float tmin,
    out float tmax)
{
    bool hit = false;

    float b = dot(origin, direction);
    float c = dot(origin, origin) - bounding*bounding;
    float disc = b*b - c;         // discriminant
    tmin = tmax = 0.0;

    if (disc > 0.0) {
        // Real root of disc, so intersection
        float sdisc = sqrt(disc);
        
        tmin=max(0.,-b - sdisc);//DE(origin + max(0.,t0) * direction, min_dist);//
        tmax=max(0.,-b + sdisc);//max(0.,t0)+t1;
        hit = true;
    }

    return hit;
}

// Calculate the gradient in each dimension from the intersection point
vec3 estimate_normal(vec3 z, float e)
{
    float min_dst;   // Not actually used in this particular case
    vec3 z1 = z + vec3(e, 0, 0);
    vec3 z2 = z - vec3(e, 0, 0);
    vec3 z3 = z + vec3(0, e, 0);
    vec3 z4 = z - vec3(0, e, 0);
    vec3 z5 = z + vec3(0, 0, e);
    vec3 z6 = z - vec3(0, 0, e);

    float dx = DE(z1, min_dst) - DE(z2, min_dst);
    float dy = DE(z3, min_dst) - DE(z4, min_dst);
    float dz = DE(z5, min_dst) - DE(z6, min_dst);

    return normalize(vec3(dx, dy, dz) / (2.0*e));
}


// Computes the direct illumination for point pt with normal N due to
// a point light at light and a viewer at eye.
vec3 Phong(vec3 pt, vec3 N, out float specular)
{
    vec3 diffuse   = vec3(0);         // Diffuse contribution
    vec3 color   = vec3(0);
    specular = 0.0;

    // vec3 L = normalize(light * objRotation - pt); // find the vector to the light
    vec3 L = normalize((modelMatrix * vec4(light,1)).xyz - pt);
    float  NdotL = dot(N, L);         // find the cosine of the angle between light and normal

    if (NdotL > 0.0) {
        // Diffuse shading
        diffuse = diffuseColor.rgb + abs(N) * colorSpread;
        diffuse *= lightColor.rgb * NdotL;

        // Phong highlight
        vec3 E = normalize(eye - pt);      // find the vector to the eye
        vec3 R = L - 2.0 * NdotL * N;      // find the reflected vector
        float  RdE = dot(R,E);

        if (RdE <= 0.0) {
            specular = specularity * pow(abs(RdE), specularExponent);
        }
    } else {
        diffuse = diffuseColor.rgb * abs(NdotL) * rimLight;
    }

    return (ambientColor.rgb * ambientColor.a) + diffuse;
}

// Define the ray direction from the pixel coordinates
vec3 rayDirection(vec2 p)
{
    vec3 direction = vec3( 2.0 * aspectRatio * p.x / float(size.x) - aspectRatio,
        -2.0 * p.y / float(size.y) + 1.0,
        // -2.0 * exp(cameraZoom)
        0.0);
    // return normalize(direction * viewRotation * objRotation);
    return normalize((modelViewMatrix * vec4(direction,1)).xyz);
    // return normalize((viewMatrix * vec4(direction,1)).xyz);
}

// Calculate the output colour for each input pixel
vec4 renderPixel(vec3 ray_direction)
{
    float tmin, tmax;
    vec4 pixel_color = backgroundColor;

    if (intersectBoundingSphere(eye, ray_direction, tmin, tmax)) {
        vec3 ray = eye + tmin * ray_direction;

        float dist, ao;
        float min_dist = 2.0;
        float ray_length = tmin;
        float eps = MIN_EPSILON;

        // number of raymarching steps scales inversely with factor
        int max_steps = int(float(STEP_LIMIT) / epsilonScale);
        int i;
        float f;

        for (int l = 0; l < STEP_LIMIT; ++l) {
            dist = DE(ray, min_dist);

            // March ray forward
            f = epsilonScale * dist;
            ray += f * ray_direction;
            ray_length += f * dist;

            // Are we within the intersection threshold or completely missed the fractal
            if (dist < eps || ray_length > tmax) {
                break;
            }

            // Set the intersection threshold as a function of the ray length away from the camera
            //eps = max(max(MIN_EPSILON, eps_start), pixel_scale * pow(ray_length, epsilonScale));
            eps = max(MIN_EPSILON, pixel_scale * ray_length);
            i++;
        }


        // Found intersection?
        if (dist < eps) {
            ao   = 1.0 - clamp(1.0 - min_dist * min_dist, 0.0, 1.0) * ambientOcclusion;

            if (phong) {
                vec3 normal = estimate_normal(ray, eps/2.0);
                float specular = 0.0;
                pixel_color.rgb = Phong(ray, normal, specular);

                if (shadows > 0.0) {
                    // The shadow ray will start at the intersection point and go
                    // towards the point light. We initially move the ray origin
                    // a little bit along this direction so that we don't mistakenly
                    // find an intersection with the same point again.
                    // vec3 light_direction = normalize((light - ray) * objRotation);
                    vec3 light_direction = normalize(modelMatrix * vec4(light - ray, 1)).xyz;
                    ray += normal * eps * 2.0;

                    float min_dist2;
                    dist = 4.0;

                    for (int j = 0; j < STEP_LIMIT; ++j) {
                        dist = DE(ray, min_dist2);

                        // March ray forward
                        f = epsilonScale * dist;
                        ray += f * light_direction;

                        // Are we within the intersection threshold or completely missed the fractal
                        if (dist < eps || dot(ray, ray) > bounding * bounding)
                            break;
                    }

                    // Again, if our estimate of the distance to the set is small, we say
                    // that there was a hit and so the source point must be in shadow.
                    if (dist < eps) {
                        pixel_color.rgb *= 1.0 - shadows;
                    } else {
                        // Only add specular component when there is no shadow
                        pixel_color.rgb += specular;
                    }
                } else {
                    pixel_color.rgb += specular;
                }
            } else {
                // Just use the base colour
                pixel_color.rgb = diffuseColor.rgb;
            }

            ao *= 1.0 - (float(i) / float(max_steps)) * ambientOcclusionEmphasis * 2.0;
            pixel_color.rgb *= ao;
            // if (length(pixel_color.rgb) >= 0.98)
            //     pixel_color.r = 0.0;
            pixel_color.a = 1.0;
        }
#ifdef DEBUG_COLORS
        else
        {
            // some debugging to show the difference
            vec3 ray2 = eye + tmin * ray_direction;
            pixel_color.r = DE_blog    (ray2, tmin) / bailout;
            pixel_color.g = DE_original(ray2, tmin) / bailout;
            pixel_color.b = DE         (ray2, tmin) / bailout;
        }
#endif
    }
    else
    {
        pixel_color = vec4(0.3,0,0,1);
    }

    return pixel_color;
}

void main() {
    gl_FragColor = renderPixel(normalize(rayDir));
}








































































































/**
Most of this code was copied from:
https://code.google.com/p/webgl-mandelbulb/source/browse/3dmandelbrot.html
The original changelog/copyright/licencse copied below after the dashed line.

three.js modifications by:

Greg Slepak
https://twitter.com/taoeffect
https://github.com/taoeffect

With special thanks to:
- eiffie
- Syntopia
- knighty
- cKleinhuis

And everyone else on the fractalforums!
http://www.fractalforums.com/mandelbulb-implementation/webgl-mandelbulb-with-three-js-flythrough-controls-(optimizations-wanted)

Last update: August 11, 2013

Changelog:
    1.1   - Two additional DE functions to choose from, now using the one from the forums
            because it's faster. Ray direction now calculated using 'modelViewProjectMatrixInverse'
            Original DE function renamed to 'DE_original'. Phase disabled because it looks ugly
            with the new DE functions.

---------------------------------------------------

 3dmandelbrot was put together by:
 Michael Jewell <michael.jewell@maine.edu>,  
 Jesse Altman <jesse.altman@maine.edu>,
 Shane Christy <shane.christy@maine.edu>,
 Kayla Christina Artinyan <kayla.artinyan@maine.edu> from the universtiy of southern maine for Bruce Macleod's Interactive Graphics course
 
 The origin of our mandelbulb equations:
 * Mandelbulb.pbk
 * Last update: 14 December 2009
 *
 * Changelog:
 *      1.0     - Initial release
 *      1.0.1   - Fixed a missing asymmetry thanks to Chris King (http://www.dhushara.com)
 *              - Refinements in the colouring
 *      1.0.2   - Added radiolaria option for a funky hair-like effect
 *              - Incorporated the scalar derivative method as described here:
 *              - http://www.fractalforums.com/mandelbulb-implementation/realtime-renderingoptimisations/
 *      1.0.3   - Created a quick version of the script as using a boolean flag to determine
 *                which distance estimation method created long compilation times.
 *      1.0.4   - Fixed issue with older graphic cards and the specular highlights
 *
 *
 * Copyright (c) 2009 Tom Beddard
 * http://www.subblue.com
 *
 * For more Flash and PixelBender based generative graphics experiments see:
 * http://www.subblue.com/blog
 *
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 *
 * Credits and references
 * ======================
 * For the story behind the 3D Mandelbrot see the following page:
 * http://www.skytopia.com/project/fractal/mandelbulb.html
 *
 * The original forum disussion with many implementation details can be found here:
 * http://www.fractalforums.com/3d-fractal-generation/true-3d-mandlebrot-type-fractal/
 *
 * This implementation references the 4D Quaternion GPU Raytracer by Keenan Crane:
 * http://www.devmaster.net/forums/showthread.php?t=4448
 *
 * and the NVIDIA CUDA/OptiX implementation by cbuchner1:
 * http://forums.nvidia.com/index.php?showtopic=150985
 *
 *  -- noise provided by --
 *The following is noise calculations are provided from
 * Original noise Author: Stefan Gustavson ITN-LiTH (stegu@itn.liu.se) 2004-12-05
 * Simplex indexing functions by Bill Licea-Kane, ATI
 *
 * You may use, modify and redistribute this code free of charge,
 * provided that the author's names and this notice appear intact.
 *
 * The code was hosted at http://www.pcprogramming.com/NoiseCube.html
 */

 /*

 #ifdef OLD_CODE

bool  radiolaria=false;
float radiolariaFactor=0.0;

float DE_conversion_attempt_in_progress_(vec3 z0, inout float min_dist)
{
    vec4 z = vec4(z0, 1.0);
    float pd = power - 1.0;          // power for derivative

    // Convert z to polar coordinates
    float r    = length(z), theta,phi;

    // Record z orbit distance for ambient occulsion shading
    if (r < min_dist) min_dist = r;

    vec3 dz;
    float ph_dz = 0.0;
    float th_dz = 0.0;
    float powR, powRsin;

    // Iterate to compute the distance estimator.
    for (int n=0; n < MAX_ITERATIONS; n++) {
        phi = atan(z.y, z.x) + phase.x;
        theta = acos(z.z / r) + phase.y;

        // Calculate derivative of
        powR = power * pow(r, pd);
        powRsin = powR * z.w * sin(ph_dz + pd*theta);
        dz.x = powRsin * cos(th_dz + pd*phi) + 1.0;
        dz.y = powRsin * sin(th_dz + pd*phi);
        dz.z = powR * z.w * cos(ph_dz + pd*theta);

        // polar coordinates of derivative dz
        z.w  = length(dz);
        th_dz = atan(dz.y, dz.x);
        ph_dz = acos(dz.z / z.w);

        // z iteration
        powRsin = sin(power*theta);
        z.x = powR * powRsin * cos(power*phi);
        z.y = powR * powRsin * sin(power*phi);
        z.z = powR * cos(power*theta);
        z += z0;
        z = powR *  vec4()

        // The triplex power formula applies the azimuthal angle rotation about the y-axis.
        // Constrain this to get some funky effects
        if (radiolaria && z.y > radiolariaFactor) z.y = radiolariaFactor;

        r  = length(z);
        if (r < min_dist) min_dist = r;
        if (r > bailout) break;


    }

    // Return the distance estimation value which determines the next raytracing
    // step size, or if whether we are within the threshold of the surface.
    return 0.5 * r * log(r)/z.w;
}

// Intersect bounding sphere
//
// If we intersect then set the tmin and tmax values to set the start and
// end distances the ray should traverse.
bool intersectBoundingSphere(vec3 origin,
    vec3 direction,
    out float tmin,
    out float tmax)
{
    bool hit = false;

    //vec3 pN = vec3(0, 0, 1.0);
    //float  t  = -(dot(origin, pN) + slice) / dot(direction, pN);
    //origin = origin + t * direction;

    float b = dot(origin, direction);
    float c = dot(origin, origin) - bounding;
    float disc = b*b - c;         // discriminant
    tmin = tmax = 0.0;

    if (disc > 0.0) {
        // Real root of disc, so intersection
        float sdisc = sqrt(disc);
        float t0 = -b - sdisc;         // closest intersection distance
        float t1 = -b + sdisc;         // furthest intersection distance

        if (t0 >= 0.0) {
            // Ray intersects front of sphere
            float min_dist;
            vec3 z = origin + t0 * direction;
            tmin = DE(z, min_dist);
            tmax = t0 + t1;
        } else if (t0 < 0.0) {
            // Ray starts inside sphere
            float min_dist;
            vec3 z = origin;
            tmin = DE(z, min_dist);
            tmax = t1;
        }
        hit = true;
    }

    return hit;
}

// The fractal calculation
//
// Calculate the closest distance to the fractal boundary and use this
// distance as the size of the step to take in the ray marching.
//
// Fractal formula:
//     z' = z^p + c
//
// For each iteration we also calculate the derivative so we can estimate
// the distance to the nearest point in the fractal set, which then sets the
// maxiumum step we can move the ray forward before having to repeat the calculation.
//
//    dz' = p * z^(p-1)
//
// The distance estimation is then calculated with:
//
//   0.5 * |z| * log(|z|) / |dz|
//
float DE_original(vec3 z0, inout float min_dist)
{
    vec3 c = z0; // Julia set has fixed c, Mandelbrot c changes with location
    vec3 z = z0;
    float pd = power - 1.0;          // power for derivative

    // Convert z to polar coordinates
    float r    = length(z);
    float th = atan(z.y, z.x);
    float ph = asin(z.z / r);

    // Record z orbit distance for ambient occulsion shading
    if (r < min_dist) min_dist = r;

    vec3 dz;
    float ph_dz = 0.0;
    float th_dz = 0.0;
    float r_dz   = 1.0;
    float powR, powRsin;

    // Iterate to compute the distance estimator.
    for (int n=0; n < MAX_ITERATIONS; n++) {
        // Calculate derivative of
        powR = power * pow(r, pd);
        powRsin = powR * r_dz * sin(ph_dz + pd*ph);
        dz.x = powRsin * cos(th_dz + pd*th) + 1.0;
        dz.y = powRsin * sin(th_dz + pd*th);
        dz.z = powR * r_dz * cos(ph_dz + pd*ph);

        // polar coordinates of derivative dz
        r_dz  = length(dz);
        th_dz = atan(dz.y, dz.x);
        ph_dz = acos(dz.z / r_dz);

        // z iteration
        powR = pow(r, power);
        powRsin = sin(power*ph);
        z.x = powR * powRsin * cos(power*th);
        z.y = powR * powRsin * sin(power*th);
        z.z = powR * cos(power*ph);
        z += c;

        // The triplex power formula applies the azimuthal angle rotation about the y-axis.
        // Constrain this to get some funky effects
        if (radiolaria && z.y > radiolariaFactor) z.y = radiolariaFactor;

        r  = length(z);
        if (r < min_dist) min_dist = r;
        if (r > bailout) break;

        th = atan(z.y, z.x) + phase.x;
        ph = acos(z.z / r) + phase.y;

    }

    // Return the distance estimation value which determines the next raytracing
    // step size, or if whether we are within the threshold of the surface.
    return 0.5 * r * log(r)/r_dz;
}

// FROM: http://blog.hvidtfeldts.net/index.php/2011/09/distance-estimated-3d-fractals-v-the-mandelbulb-different-de-approximations/
float DE_blog(vec3 pos, inout float min_dist) {
    vec3 z = pos;
    float dr = 1.0;
    float r = length(z);
    if (r < min_dist) min_dist = r;
    for (int i = 0; i < MAX_ITERATIONS ; i++) {
        // convert to polar coordinates
        float theta = acos(z.z/r) + phase.y;
        float phi = atan(z.y,z.x) + phase.x;
        dr =  pow( r, power-1.0)*power*dr + 1.0;
        
        // scale and rotate the point
        float zr = pow( r,power);
        theta = theta*power;
        phi = phi*power;
        
        // convert back to cartesian coordinates
        z = zr*vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
        z+=pos;

        r = length(z);
        if (r < min_dist) min_dist = r;
        if (r>bailout) break;
    }
    return 0.5*log(r)*r/dr;
}

// FROM: http://www.fractalforums.com/index.php?topic=16793.msg64299#msg64299
float DE_forum_original(vec3 z0, inout float min_dist){//MandelBulb by twinbee
    vec4 z = vec4(z0,1.0), c = z;
    float r = length(z.xyz),zr,theta,phi,p=power;//p is the power
    if (r < min_dist) min_dist = r;
    for (int n = 0; n < MAX_ITERATIONS; n++) {
        // phi = atan(z.y, z.x) * p;// th = atan(z.y, z.x) + phase.x; ...and here
        // theta = asin(z.z / r) * p;// ph = acos(z.z / r) + phase.y; add phase shifts here 
        phi = (atan(z.y, z.x) + phase.x) * p;// th = atan(z.y, z.x) + phase.x; ...and here
        theta = (asin(z.z / r) + phase.y) * p;// ph = acos(z.z / r) + phase.y; add phase shifts here 
        zr = pow(r, p-1.0);
        z=zr*vec4(r*vec3(cos(theta)*vec2(cos(phi),sin(phi)),sin(theta)),z.w*p)+c; // this version was from the forums
        // z = zr*vec4(r*vec3(sin(theta)*vec2(cos(phi),sin(phi)), cos(theta)),z.w*p)+c; // this version from the blog
        r = length(z.xyz);
        if (r < min_dist) min_dist = r;
        if (r > bailout) break;
    }
    return 0.5 * log(r) * r / z.w;
}

#endif


*/