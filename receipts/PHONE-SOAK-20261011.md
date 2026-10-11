# E1-KNOWLEDGE-2 PHONE SOAK (owner-run, Termux, Oct 11 2026)

Purpose: address the OPEN battery observation and the limit the owner
named: the 22 s gate run does not establish sustained stability.

Source: owner's terminal screenshot (soak output) plus status-bar icons
in two owner screenshots. Transcribed from images, not a machine receipt.
No JSON receipt exists for the soak (the kit prints to the terminal only).

## Reported output (verbatim values)
- SOAK START 2026-10-11T08:07:29.908Z (UTC)
- SOAK END   2026-10-11T08:17:33.049Z (UTC) = 10 min 3.1 s wall
- iterations: 223
- queries: 4460 (223 x 20, arithmetic checked)
- top1: 4237 / 4460 = 95.0% (equals 19/20 per iteration, the same
  known "Monthly Reports" tie miss on every cycle)
- peak RSS: 102.54 MB (the 22 s gate run recorded 113.57 MB)
- device: same phone as the accepted gate run (Android arm, 1,830 MB RAM,
  node v24.18.0)

## Battery observation
- Status-bar icon: 84% at about 09:08 local and 84% at about 09:17 local
  (screenshots). Whole-percent icon reading only: it does not resolve
  changes under 1 point and is not telemetry.
- termux-api package installed, but the Termux:API companion app and
  termux-battery-status output were not provided. No telemetry exists.
- Heating / thermal observation: NOT REPORTED by owner.

## What this establishes
- Over 10 minutes and 4,460 queries: no crash, no failure, no accuracy
  drift (95.0% = the per-iteration result), RSS did not grow beyond the
  gate-run peak.
- Battery: no visible drop on the status-bar icon across the run. This
  is a weak observation, not a measurement.

## What it does NOT establish
- Multi-hour or background stability; behaviour under screen-off or
  Android doze (screen state during the run was not recorded).
- A battery cost figure; thermal behaviour.
- 20K-corpus behaviour on device (this soak used the 5K core).

## Status
Battery observation: PARTIALLY ADDRESSED, stays OPEN for formal closure
until the owner rules. To close properly: install the Termux:API app and
run termux-battery-status before and after, or state a heating note.
