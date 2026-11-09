# Hardware design record

This record transcribes the project owner's design and assembly screenshots. The render and layout are design references. Exact carrier-board revision, display and camera SKUs, final CAD exports, firmware and measured bench results are outside the supplied materials.

| Subsystem | Shown in the design | Integration information to confirm |
| --- | --- | --- |
| Compute | NVIDIA Jetson Orin Nano | Carrier revision, cooling, power input, camera and display support |
| Scene capture | Front-mounted global-shutter MIPI camera | Sensor model, connector and driver; video capture path |
| Orientation | BNO085 9-axis IMU | Breakout, interface, axis mapping and timestamps |
| Control bus | TCA9548A I²C switch | Channel map, logic levels, pull-ups and addresses |
| Near-eye display | Two modules labeled 0.5-inch Micro-OLED | Exact panels, color and video support, controller, optics and mounting |
| Power | USB-C PD 3.0 buck-boost controller and 3.7 V / 2,000 mAh Li-Po shown | Actual board and battery ratings, protection, thermal behavior and peak load compatibility |
| Mechanics | PETG enclosure, bridge camera mount, display holders, compute and IMU mounts, I²C bracket and head strap attachment | CAD export, clearances, fastener dimensions, strain relief and balance |

The [TI TCA9548A datasheet](https://www.ti.com/lit/ds/symlink/tca9548a.pdf) describes an I²C switch. Treat the pictured wiring as a functional sketch. Camera and panel pixel streams require interfaces supported by the selected modules and carrier. I²C control or enumeration alone does not establish a video path.

## Build sequence in the design workspace

1. **Fabricate.** Prepare the enclosure and mounts, fit the M2 heat-set inserts, and inspect the prints. [Print plan](../assets/hardware/04-fabrication.jpg) · [Inserts](../assets/hardware/05-inserts.jpg)
2. **Wire.** The design separates power distribution, peripheral connections and continuity checks. Use verified part documentation for pinouts and electrical limits. [Power and data](../assets/hardware/06-data-and-power.jpg) · [Power checks](../assets/hardware/07-bench-power.jpg)
3. **Bring up on the bench.** The recorded checklist covers power, sensor enumeration, display output, IMU calibration and camera latency. The screenshots document the checklist. [Bring-up](../assets/hardware/08-bring-up.jpg)
4. **Assemble.** Fit the camera, IMU, compute board and display holders, then route cables with strain relief and check the strap fit. [Module mounting](../assets/hardware/09-module-installation.jpg) · [Final assembly plan](../assets/hardware/10-final-assembly.jpg)

## Design gallery

- [Concept workspace](../assets/hardware/01-concept.jpg)
- [Electrical block sketch](../assets/hardware/02-wiring.jpg)
- [Mechanical placement and parts tree](../assets/hardware/03-layout.jpg)

## Bench evidence for hardware integration

Record the exact part revisions, verified power budget, camera mode and dropped frames, per-eye output and alignment, temperatures and camera-to-display latency. For latency, measure the time from an external visual event to its reproduction at the display. Software grading time measures only one part of this path. The published software does not implement IMU fusion, panel drivers or stereo reconstruction.
