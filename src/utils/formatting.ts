import { DateTime, Duration } from "luxon";

import type {
  IntervalsDto,
  Interval,
  IntervalGroup,
} from "../client/generated/types.gen";

/**
 * Format an activity into a readable string.
 */
export function formatActivitySummary(
  activity: Record<string, unknown>
): string {
  let start_time = activity.startTime || activity.start_date || "Unknown";
  if (typeof start_time === "string" && start_time.length > 10) {
    try {
      // Use luxon for robust ISO parsing
      const dt = DateTime.fromISO(start_time.replace("Z", "+00:00"));
      if (dt.isValid) {
        start_time = dt.toFormat("yyyy-MM-dd HH:mm:ss");
      }
    } catch {
      // leave as is
    }
  }

  let rpe = activity.perceived_exertion ?? activity.icu_rpe ?? "N/A";
  if (typeof rpe === "number") rpe = `${rpe}/10`;
  let feel = activity.feel ?? "N/A";
  if (typeof feel === "number") feel = `${feel}/5`;

  return `
Activity: ${activity.name || "Unnamed"}
ID: ${activity.id || "N/A"}
Type: ${activity.type || "Unknown"}
Date: ${start_time}
Description: ${activity.description || "N/A"}
Distance: ${activity.distance || 0} meters
Duration: ${activity.duration ?? activity.elapsed_time ?? 0} seconds
Moving Time: ${activity.moving_time ?? "N/A"} seconds
Elevation Gain: ${activity.elevationGain ?? activity.total_elevation_gain ?? 0} meters
Elevation Loss: ${activity.total_elevation_loss ?? "N/A"} meters

Power Data:
Average Power: ${activity.avgPower ?? activity.icu_average_watts ?? activity.average_watts ?? "N/A"} watts
Weighted Avg Power: ${activity.icu_weighted_avg_watts ?? "N/A"} watts
Training Load: ${activity.trainingLoad ?? activity.icu_training_load ?? "N/A"}
FTP: ${activity.icu_ftp ?? "N/A"} watts
Kilojoules: ${activity.icu_joules ?? "N/A"}
Intensity: ${activity.icu_intensity ?? "N/A"}
Power:HR Ratio: ${activity.icu_power_hr ?? "N/A"}
Variability Index: ${activity.icu_variability_index ?? "N/A"}

Heart Rate Data:
Average Heart Rate: ${activity.avgHr ?? activity.average_heartrate ?? "N/A"} bpm
Max Heart Rate: ${activity.max_heartrate ?? "N/A"} bpm
LTHR: ${activity.lthr ?? "N/A"} bpm
Resting HR: ${activity.icu_resting_hr ?? "N/A"} bpm
Decoupling: ${activity.decoupling ?? "N/A"}

Other Metrics:
Cadence: ${activity.average_cadence ?? "N/A"} rpm
Calories: ${activity.calories ?? "N/A"}
Average Speed: ${activity.average_speed ?? "N/A"} m/s
Max Speed: ${activity.max_speed ?? "N/A"} m/s
Average Stride: ${activity.average_stride ?? "N/A"}
L/R Balance: ${activity.avg_lr_balance ?? "N/A"}
Weight: ${activity.icu_weight ?? "N/A"} kg
RPE: ${rpe}
Session RPE: ${activity.session_rpe ?? "N/A"}
Feel: ${feel}

Environment:
Trainer: ${activity.trainer ?? "N/A"}
Average Temp: ${activity.average_temp ?? "N/A"}°C
Min Temp: ${activity.min_temp ?? "N/A"}°C
Max Temp: ${activity.max_temp ?? "N/A"}°C
Avg Wind Speed: ${activity.average_wind_speed ?? "N/A"} km/h
Headwind %: ${activity.headwind_percent ?? "N/A"}%
Tailwind %: ${activity.tailwind_percent ?? "N/A"}%

Training Metrics:
Fitness (CTL): ${activity.icu_ctl ?? "N/A"}
Fatigue (ATL): ${activity.icu_atl ?? "N/A"}
TRIMP: ${activity.trimp ?? "N/A"}
Polarization Index: ${activity.polarization_index ?? "N/A"}
Power Load: ${activity.power_load ?? "N/A"}
HR Load: ${activity.hr_load ?? "N/A"}
Pace Load: ${activity.pace_load ?? "N/A"}
Efficiency Factor: ${activity.icu_efficiency_factor ?? "N/A"}

Device Info:
Device: ${activity.device_name ?? "N/A"}
Power Meter: ${activity.power_meter ?? "N/A"}
File Type: ${activity.file_type ?? "N/A"}
`;
}

/**
 * Format a workout into a readable string.
 */
export function formatWorkout(workout: Record<string, unknown>): string {
  return `
Workout: ${workout.name || "Unnamed"}
Description: ${workout.description || "No description"}
Sport: ${workout.sport || "Unknown"}
Duration: ${workout.duration || 0} seconds
TSS: ${workout.tss ?? "N/A"}
Intervals: ${Array.isArray(workout.intervals) ? workout.intervals.length : 0}
`;
}

/**
 * Format a wellness data entry into a readable string with all available fields.
 */
export function formatWellnessEntry(entry: Record<string, unknown>): string {
  // Convert sleep seconds to hours if available
  let sleep_hours = "N/A";
  if (entry.sleepSecs != null && typeof entry.sleepSecs === "number") {
    sleep_hours = (entry.sleepSecs / 3600).toFixed(2);
  } else if (entry.sleepHours != null) {
    sleep_hours = String(entry.sleepHours);
  }

  // Format menstrual phase with proper capitalization if present
  let menstrual_phase = entry.menstrualPhase;
  if (typeof menstrual_phase === "string" && menstrual_phase) {
    menstrual_phase =
      menstrual_phase.charAt(0).toUpperCase() + menstrual_phase.slice(1);
  } else {
    menstrual_phase = "N/A";
  }
  let menstrual_phase_predicted = entry.menstrualPhasePredicted;
  if (
    typeof menstrual_phase_predicted === "string" &&
    menstrual_phase_predicted
  ) {
    menstrual_phase_predicted =
      menstrual_phase_predicted.charAt(0).toUpperCase() +
      menstrual_phase_predicted.slice(1);
  } else {
    menstrual_phase_predicted = "N/A";
  }

  // Format sport information if available
  let sport_info = "  None available";
  if (Array.isArray(entry.sportInfo) && entry.sportInfo.length > 0) {
    sport_info = entry.sportInfo
      .map(
        (sport: Record<string, unknown>) =>
          `  * ${sport.type || "Unknown"}: eFTP = ${sport.eftp ?? "N/A"}`
      )
      .join("\n");
  }

  return `Date: ${entry.date || "Unknown date"}
ID: ${entry.id || "N/A"}

Training Metrics:
  Fitness (CTL): ${entry.ctl ?? "N/A"}
  Fatigue (ATL): ${entry.atl ?? "N/A"}
  Ramp Rate: ${entry.rampRate ?? "N/A"}
  CTL Load: ${entry.ctlLoad ?? "N/A"}
  ATL Load: ${entry.atlLoad ?? "N/A"}

Sport-Specific Info:
${sport_info}

Vital Signs:
  Weight: ${entry.weight ?? "N/A"} kg
  Resting HR: ${entry.restingHR ?? "N/A"} bpm
  HRV: ${entry.hrv ?? "N/A"}
  HRV SDNN: ${entry.hrvSDNN ?? "N/A"}
  Average Sleeping HR: ${entry.avgSleepingHR ?? "N/A"} bpm
  SpO2: ${entry.spO2 ?? "N/A"}%
  Blood Pressure: ${entry.systolic ?? "N/A"}/${entry.diastolic ?? "N/A"} mmHg
  Respiration: ${entry.respiration ?? "N/A"} breaths/min
  Blood Glucose: ${entry.bloodGlucose ?? "N/A"} mmol/L
  Lactate: ${entry.lactate ?? "N/A"} mmol/L
  VO2 Max: ${entry.vo2max ?? "N/A"} ml/kg/min
  Body Fat: ${entry.bodyFat ?? "N/A"}%
  Abdomen: ${entry.abdomen ?? "N/A"} cm
  Baevsky Stress Index: ${entry.baevskySI ?? "N/A"}

Sleep & Recovery:
  Sleep: ${sleep_hours} hours
  Sleep Score: ${entry.sleepScore ?? "N/A"}
  Sleep Quality: ${entry.sleepQuality ?? "N/A"}/4
  Readiness Score: ${entry.readiness ?? "N/A"}

Menstrual Tracking:
  Menstrual Phase: ${menstrual_phase}
  Predicted Phase: ${menstrual_phase_predicted}

Subjective Feelings:
  Soreness: ${entry.soreness ?? "N/A"}/14
  Fatigue: ${entry.fatigue ?? "N/A"}/4
  Stress: ${entry.stress ?? "N/A"}/4
  Mood: ${entry.mood ?? "N/A"}/4
  Motivation: ${entry.motivation ?? "N/A"}/4
  Injury Level: ${entry.injury ?? "N/A"}/4

Nutrition & Hydration:
  Calories Consumed: ${entry.kcalConsumed ?? "N/A"} kcal
  Hydration Score: ${entry.hydration ?? "N/A"}/4
  Hydration Volume: ${entry.hydrationVolume ?? "N/A"} ml

Activity:
  Steps: ${entry.steps ?? "N/A"}

Comments: ${entry.comments ?? "No comments"}
Status: ${entry.locked ? "Locked" : "Unlocked"}
Last Updated: ${entry.updated ?? "Unknown"}`;
}

/**
 * Format a basic event summary into a readable string.
 */
export function formatEventSummary(event: Record<string, unknown>): string {
  const event_date = event.start_date_local || event.date || "Unknown";
  let event_type = "Other";
  if (event.workout) event_type = "Workout";
  else if (event.race) event_type = "Race";
  const event_name = event.name || "Unnamed";
  const event_id = event.id || "N/A";
  const event_desc = event.description || "No description";
  return `Date: ${event_date}
ID: ${event_id}
Type: ${event_type}
Name: ${event_name}
Description: ${event_desc}`;
}

/**
 * Format detailed event information into a readable string.
 */
export function formatEventDetails(event: Record<string, unknown>): string {
  let event_details = `Event Details:\n\nID: ${event.id || "N/A"}\nDate: ${event.date || "Unknown"}\nName: ${event.name || "Unnamed"}\nDescription: ${event.description || "No description"}`;
  if (event.workout && typeof event.workout === "object") {
    const workout = event.workout as Record<string, unknown>;
    event_details += `\n\nWorkout Information:\nWorkout ID: ${workout.id || "N/A"}\nSport: ${workout.sport || "Unknown"}\nDuration: ${workout.duration || 0} seconds\nTSS: ${workout.tss ?? "N/A"}`;
    if (Array.isArray(workout.intervals)) {
      event_details += `\nIntervals: ${workout.intervals.length}`;
    }
  }
  if (event.race) {
    event_details += `\n\nRace Information:\nPriority: ${event.priority ?? "N/A"}\nResult: ${event.result ?? "N/A"}`;
  }
  if (event.calendar && typeof event.calendar === "object") {
    const cal = event.calendar as Record<string, unknown>;
    event_details += `\n\nCalendar: ${cal.name ?? "N/A"}`;
  }
  return event_details;
}

/**
 * Format intervals data into a markdown table for both groups and individual intervals.
 */
export function formatIntervalsTable(intervalsData: IntervalsDto): string {
  let result = "";
  // Interval Groups Table
  if (
    Array.isArray(intervalsData.icu_groups) &&
    intervalsData.icu_groups.length > 0
  ) {
    result += "### Interval Groups\n\n";
    result +=
      "| # | Type | Duration | Distance | Avg Power | Avg HR | Intensity | Speed |\n";
    result +=
      "|---|------|----------|----------|-----------|---------|-----------|-------|\n";
    intervalsData.icu_groups.forEach((group: IntervalGroup, i: number) => {
      const duration = group.elapsed_time
        ? formatSeconds(group.elapsed_time)
        : "N/A";
      const distance =
        group.distance != null
          ? (group.distance / 1000).toFixed(2) + "km"
          : "N/A";
      const avgPower =
        group.average_watts != null ? group.average_watts + "W" : "N/A";
      const avgHR =
        group.average_heartrate != null
          ? group.average_heartrate + " bpm"
          : "N/A";
      const intensity = group.intensity != null ? group.intensity + "%" : "N/A";
      const speed =
        group.average_speed != null
          ? (group.average_speed * 3.6).toFixed(1)
          : "N/A";
      // Type and count (IntervalGroup does not have 'type', so just show count if present)
      const type = group.count ? `(${group.count}x)` : "";
      result += `| ${i + 1} | ${type} | ${duration} | ${distance} | ${avgPower} | ${avgHR} | ${intensity} | ${speed} |\n`;
    });
    result += "\n";
  }
  // Individual Intervals Table
  if (
    Array.isArray(intervalsData.icu_intervals) &&
    intervalsData.icu_intervals.length > 0
  ) {
    result += "### Individual Intervals\n\n";
    result +=
      "| # | Type | Duration | Distance | Avg Power | Max Power | Avg HR | Max HR | Intensity | Speed |\n";
    result +=
      "|---|------|----------|----------|-----------|-----------|---------|---------|-----------|-------|\n";
    intervalsData.icu_intervals.forEach((interval: Interval, i: number) => {
      const duration = interval.elapsed_time
        ? formatSeconds(interval.elapsed_time)
        : "N/A";
      const distance =
        interval.distance != null
          ? (interval.distance / 1000).toFixed(2) + "km"
          : "N/A";
      const avgPower =
        interval.average_watts != null ? interval.average_watts + "W" : "N/A";
      const maxPower =
        interval.max_watts != null ? interval.max_watts + "W" : "N/A";
      const avgHR =
        interval.average_heartrate != null ? interval.average_heartrate : "N/A";
      const maxHR =
        interval.max_heartrate != null ? interval.max_heartrate : "N/A";
      const intensity =
        interval.intensity != null ? interval.intensity + "%" : "N/A";
      const speed =
        interval.average_speed != null
          ? (interval.average_speed * 3.6).toFixed(1)
          : "N/A";
      const type = interval.type
        ? interval.type.charAt(0) + interval.type.slice(1).toLowerCase()
        : "";
      result += `| ${i + 1} | ${type} | ${duration} | ${distance} | ${avgPower} | ${maxPower} | ${avgHR} | ${maxHR} | ${intensity} | ${speed} |\n`;
    });
    result += "\n";
  }
  return result.trim();
}

function formatSeconds(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "N/A";
  return Duration.fromObject({ seconds }).toFormat("m:ss");
}

/**
 * Format intervals data into a readable string with all available fields.
 */
export function formatIntervals(
  intervalsData: Record<string, unknown>
): string {
  let result = `Intervals Analysis:\n\nID: ${intervalsData.id || "N/A"}\nAnalyzed: ${intervalsData.analyzed ?? "N/A"}\n\n`;
  if (
    Array.isArray(intervalsData.icu_intervals) &&
    intervalsData.icu_intervals.length > 0
  ) {
    result += "Individual Intervals:\n\n";
    intervalsData.icu_intervals.forEach(
      (interval: Record<string, unknown>, i: number) => {
        result +=
          `[${i + 1}] ${interval.label || `Interval ${i + 1}`} (${interval.type || "Unknown"})\n` +
          `Duration: ${interval.elapsed_time || 0} seconds (moving: ${interval.moving_time || 0} seconds)\n` +
          `Distance: ${interval.distance || 0} meters\n` +
          `Start-End Indices: ${interval.start_index || 0}-${interval.end_index || 0}\n\n` +
          `Power Metrics:\n` +
          `  Average Power: ${interval.average_watts || 0} watts (${interval.average_watts_kg || 0} W/kg)\n` +
          `  Max Power: ${interval.max_watts || 0} watts (${interval.max_watts_kg || 0} W/kg)\n` +
          `  Weighted Avg Power: ${interval.weighted_average_watts || 0} watts\n` +
          `  Intensity: ${interval.intensity || 0}\n` +
          `  Training Load: ${interval.training_load || 0}\n` +
          `  Joules: ${interval.joules || 0}\n` +
          `  Joules > FTP: ${interval.joules_above_ftp || 0}\n` +
          `  Power Zone: ${interval.zone || "N/A"} (${interval.zone_min_watts || 0}-${interval.zone_max_watts || 0} watts)\n` +
          `  W' Balance: Start ${interval.wbal_start || 0}, End ${interval.wbal_end || 0}\n` +
          `  L/R Balance: ${interval.avg_lr_balance || 0}\n` +
          `  Variability: ${interval.w5s_variability || 0}\n` +
          `  Torque: Avg ${interval.average_torque || 0}, Min ${interval.min_torque || 0}, Max ${interval.max_torque || 0}\n\n` +
          `Heart Rate & Metabolic:\n` +
          `  Heart Rate: Avg ${interval.average_heartrate || 0}, Min ${interval.min_heartrate || 0}, Max ${interval.max_heartrate || 0} bpm\n` +
          `  Decoupling: ${interval.decoupling || 0}\n` +
          `  DFA α1: ${interval.average_dfa_a1 || 0}\n` +
          `  Respiration: ${interval.average_respiration || 0} breaths/min\n` +
          `  EPOC: ${interval.average_epoc || 0}\n` +
          `  SmO2: ${interval.average_smo2 || 0}% / ${interval.average_smo2_2 || 0}%\n` +
          `  THb: ${interval.average_thb || 0} / ${interval.average_thb_2 || 0}\n\n` +
          `Speed & Cadence:\n` +
          `  Speed: Avg ${interval.average_speed || 0}, Min ${interval.min_speed || 0}, Max ${interval.max_speed || 0} m/s\n` +
          `  GAP: ${interval.gap || 0} m/s\n` +
          `  Cadence: Avg ${interval.average_cadence || 0}, Min ${interval.min_cadence || 0}, Max ${interval.max_cadence || 0} rpm\n` +
          `  Stride: ${interval.average_stride || 0}\n\n` +
          `Elevation & Environment:\n` +
          `  Elevation Gain: ${interval.total_elevation_gain || 0} meters\n` +
          `  Altitude: Min ${interval.min_altitude || 0}, Max ${interval.max_altitude || 0} meters\n` +
          `  Gradient: ${interval.average_gradient || 0}%\n` +
          `  Temperature: ${interval.average_temp || 0}°C (Weather: ${interval.average_weather_temp || 0}°C, Feels like: ${interval.average_feels_like || 0}°C)\n` +
          `  Wind: Speed ${interval.average_wind_speed || 0} km/h, Gust ${interval.average_wind_gust || 0} km/h, Direction ${interval.prevailing_wind_deg || 0}°\n` +
          `  Headwind: ${interval.headwind_percent || 0}%, Tailwind: ${interval.tailwind_percent || 0}%\n\n`;
      }
    );
  }
  if (
    Array.isArray(intervalsData.icu_groups) &&
    intervalsData.icu_groups.length > 0
  ) {
    result += "Interval Groups:\n\n";
    intervalsData.icu_groups.forEach(
      (group: Record<string, unknown>, i: number) => {
        result +=
          `Group: ${group.id || `Group ${i + 1}`} (Contains ${group.count || 0} intervals)\n` +
          `Duration: ${group.elapsed_time || 0} seconds (moving: ${group.moving_time || 0} seconds)\n` +
          `Distance: ${group.distance || 0} meters\n` +
          `Start-End Indices: ${group.start_index || 0}-N/A\n\n` +
          `Power: Avg ${group.average_watts || 0} watts (${group.average_watts_kg || 0} W/kg), Max ${group.max_watts || 0} watts\n` +
          `W. Avg Power: ${group.weighted_average_watts || 0} watts, Intensity: ${group.intensity || 0}\n` +
          `Heart Rate: Avg ${group.average_heartrate || 0}, Max ${group.max_heartrate || 0} bpm\n` +
          `Speed: Avg ${group.average_speed || 0}, Max ${group.max_speed || 0} m/s\n` +
          `Cadence: Avg ${group.average_cadence || 0}, Max ${group.max_cadence || 0} rpm\n\n`;
      }
    );
  }
  return result;
}
