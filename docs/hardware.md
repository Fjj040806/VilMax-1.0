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

## Mechanical and electrical detail

The enclosure holds separate left and right display mounts. The bridge mount positions the scene camera near the center of the frame. Dedicated mounting parts locate the compute module, IMU and I²C bracket. The strap attachment and cable routing are documented as the final assembly phase. The layout screenshot records placement and approximate packaging intent. Final dimensions and print settings require the original CAD or measurements.

| Path | Documented role | Verification point |
| --- | --- | --- |
| Scene camera → compute | Forward video input, MIPI camera shown | Exact sensor, compatible carrier connector, driver and streaming mode |
| IMU and I²C switch → compute | Orientation data and low-speed bus routing | Board revision, addressing, axes, channel map and timing |
| Compute → left and right displays | Separate near-eye outputs shown | Panel and controller SKUs, supported video path and per-eye optical alignment |
| Power subsystem → electronics | Portable cell and PD buck-boost board shown | Confirm the actual power architecture using the board and battery specifications |
| Chassis → electronics and optics | PETG mounts and M2 hardware | As-built clearances, fastener lengths, thermal placement and strain relief |

See the [full 16-step build dossier](build-log.md) for the mapping from each fabrication, wiring, bring-up and assembly step to its source screenshot.
