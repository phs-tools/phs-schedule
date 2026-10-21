import { Settings } from "luxon";

// Every interval here is built from a bare "HH:mm" time, which luxon
// interprets in the system zone — UTC on servers. Setting the default zone in
// schedule.ts's body would be too late: its imports (schedule-templates.ts)
// construct their intervals at module scope, before that line runs. Importing
// this module first guarantees the zone is set before any DateTime is built,
// no matter which module the app loads first.
Settings.defaultZone = "America/Los_Angeles";
