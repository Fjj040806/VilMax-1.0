"""Render the original synthetic demo scene with Blender (optional)."""
import bpy
from mathutils import Vector
from random import Random
from pathlib import Path

rng = Random(15)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color, roughness=0.6, emission=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Emission Color'].default_value = (*color, 1)
    shader.inputs['Emission Strength'].default_value = emission
    return mat

def box(name, loc, size, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = size
    obj.data.materials.append(mat)

def point(loc, color, power, radius):
    bpy.ops.object.light_add(type='POINT', location=loc)
    bpy.context.object.data.color = color
    bpy.context.object.data.energy = power
    bpy.context.object.data.shadow_soft_size = radius

asphalt = material('Wet asphalt', (0.045, 0.055, 0.07), 0.22)
concrete = material('Pavement', (0.12, 0.13, 0.15))
dark = material('Black metal', (0.018, 0.024, 0.03))
paint = material('Road markings', (0.43, 0.4, 0.31), 0.35)
amber = material('Amber glass', (1, 0.45, 0.17), 0.32, 2)
blue = material('Blue glass', (0.12, 0.58, 1), 0.32, 2)
white = material('Marquee letters', (1, 0.82, 0.54), 0.4, 3)
rose = material('Red tail lights', (1, 0.06, 0.07), 0.3, 4)
box('Road', (0, 16, -0.16), (10, 100, 0.25), asphalt)
for side in (-1, 1):
    box('Sidewalk', (side * 4.8, 16, -0.04), (1.8, 100, 0.25), concrete)
    for n in range(7):
        y = n * 7 + 1
        height = rng.uniform(6, 14)
        wall = material('Facade', (rng.uniform(.08, .18), .10, .13))
        box('Building', (side * 7.8, y, height / 2), (5, 6.8, height), wall)
        for floor in range(1, int(height / 1.7)):
            for offset in (-2.2, 0, 2.2):
                glass = rng.choice((dark, dark, amber, blue))
                box('Window', (side * 5.27, y + offset, floor * 1.7), (.11, .91, .85), glass)
        for offset in (-1.5, 1.5):
            box('Store window', (side * 5.24, y + offset, .95), (.13, 1.9, 1.38), rng.choice((amber, blue)))
        if n % 2 == 0:
            box('Lamp pole', (side * 4.3, y, 2.2), (.08, .08, 4.4), dark)
            box('Lamp head', (side * 4.02, y, 4.4), (.65, .2, .12), white)
            point((side * 3.93, y, 4.24), (1, .73, .52), 290, .32)
for y in range(4, 45, 4):
    box('Lane stripe', (0, y, -.029), (.085, 1.7, .013), paint)
for x, y in [(-2.9, 11), (2.55, 20), (2.65, 30)]:
    box('Car body', (x, y, .5), (1.55, 3.2, .62), dark)
    box('Car cabin', (x, y+.15, .98), (1.35, 1.6, .51), dark)
    for shift in (-.55, .55):
        box('Tail lamp', (x+shift, y-1.61, .54), (.3, .08, .16), rose)
    point((x, y-1.75, .36), (1, .055, .06), 25, .20)

box('Cinema marquee', (-4.45, 3.8, 3.0), (1.7, .24, .8), dark)
bpy.ops.object.text_add(location=(-5.20, 3.66, 2.87), rotation=(1.5708, 0, 0))
label = bpy.context.object
label.data.body = 'CINEMA'
label.data.size = .29
label.data.extrude = .006
label.data.materials.append(white)
point((-4.6, 3.5, 2.8), (1, .54, .28), 115, .4)
point((3.9, 6.3, 2.4), (.26, .53, 1), 290, .65)

bpy.ops.object.camera_add(location=(-1.55, -7.7, 1.62))
camera = bpy.context.object
camera.rotation_euler = (Vector((.4, 20, 3.1)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
camera.data.lens = 31
scene = bpy.context.scene
scene.camera = camera
scene.render.engine = 'CYCLES'
scene.cycles.samples = 48
scene.cycles.use_denoising = False
scene.world.use_nodes = True
background = scene.world.node_tree.nodes.get('Background')
background.inputs[0].default_value = (.20, .25, .40, 1)
background.inputs[1].default_value = .24
scene.render.resolution_x = 960
scene.render.resolution_y = 540
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'JPEG'
scene.render.image_settings.quality = 94
scene.render.filepath = str(Path(__file__).resolve().parents[1] / 'assets/demo/street-input.jpg')
bpy.ops.render.render(write_still=True)
