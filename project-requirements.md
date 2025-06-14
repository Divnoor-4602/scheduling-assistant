# Assistant Shceduling Details

## User supplies the following to assistant: **User -> Assistant**

| Category                       | Item                                                                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Project Basics**             | • Project title and one-sentence goal<br>• Hard deadline (calendar date)                                                                |
| **Initial Scope**              | • List of major deliverables / phases                                                                                                   |
| **Capacity & Rules**           | • Daily work-hour capacity (minutes or hours)<br>• Preferred work windows per weekday (start / end)<br>• “Weekend work allowed?” Yes/No |
| **Priority / Risk**            | • Priority weight (1-5) per deliverable or task<br>• Known high-risk assumptions (e.g., “client feedback may be late”)                  |
| **Accountability Preferences** | • Nightly check-in method: phone call / email / none<br>• Burnout-alert threshold (e.g., warn if >120 % capacity)                       |

## What the assisatnt will do for the user on the call and roughly the tools it will use to acocmplish user's goals and proper project breakdown and management

| **Task Estimates** | • One “most-likely” duration for each sub-task (assistant derives optimistic & pessimistic) |

| **Estimation Logic** | Pseudo-PERT formula in code | Convert “most-likely” into optimistic/pessimistic, expected time, variance |
| **Scheduling Engine** | Greedy slotter (custom TS util) | Fits tasks into free/busy windows & obeys dependency DAG |
| **Dialog Prompts** | • Intake script<br>• Confirmation script<br>• Daily accountability script | Keep conversation consistent an short |
| **Event Streaming** | Vapi **webhook → /api/vapi-events** | Deliver transcripts, call-end events to backend for storage & analytics |
| **Notifications** | • Vapi outbound call API<br>• Resend / Postmark for email | Send nightly progress calls or emails |

The assistant will need a bunch of tools to work efficiently and smoothly with the user

- It needs to check current working hours for the person, then it will use that hours and in conjunction to the availibility in the person's google calendar, it will see what weekdays a person can work on.
- It will also ask the user if workdays are only the weekdays or the weekends too as that is essential to the scheduling for the project.
- After asking the user for the project description such as the name, main tasks, deadlines, scopes, deliverables, hard deadline and if the deadline is flexible at all, daily work capacity, priority of the bigger tasks
- If they want accountability or not, processing will be done on this information based on the PERT project management strategy, the major tasks will be decomposed on smaller tasks where they can accomplished in chunks of 1-2 hours with names, details and predecessor and successor status and according to the status of blocking and being blockey by these tasks will be added to the user's calendar and the base overviews of these tasks will be given to the user on call and a detailed view of these tasks will be visible on the dashboard. After this part is completed, the user will be allowed to opt in for a scheduling accountability reminder or for emails.

# Required tools for the assistant:

| Tool name                      | Purpose (assistant’s cue)                                              | Key parameters (JSON keys)                                                    | Expected **result** payload                                       |
| ------------------------------ | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `get_user_preferences`         | Pull work-hours grid, weekend rule, capacity, accountability mode      | `userId`                                                                      | `{ workHours, weekendAllowed, dailyCapacityMin, accountability }` |
| `set_user_preferences`         | Save or update user prefs gathered in-call                             | `userId`, `workHours`, `weekendAllowed`, `dailyCapacityMin`, `accountability` | `"ok"`                                                            |
| `get_freebusy_window`          | Return busy slots for a date range from Google Calendar                | `userId`, `start`, `end`                                                      | `{ busy: [ { start, end } ] }`                                    |
| `create_task_events`           | Batch-insert scheduled task blocks into Google Calendar                | `userId`, `events[]` (title, start, end, taskId)                              | `{ created: [ { taskId, eventId } ] }`                            |
| `update_task_event`            | Move or resize a single task event                                     | `userId`, `taskId`, `newStart`, `newEnd`                                      | `"ok"`                                                            |
| `save_project_shell`           | Create placeholder project row before decomposition                    | `userId`, `title`, `deadline`, `flexible`, `priority`                         | `{ projectId }`                                                   |
| `pert_breakdown`               | Generate ≤ 2 h tasks with optimistic / most-likely / pessimistic times | `projectId`, `deliverables[]`, `mostLikelyEst[]`                              | `{ tasks[] (taskId, title, o, m, p) }`                            |
| `infer_dependencies`           | Auto-detect predecessor → successor links                              | `projectId`, `tasks[]`                                                        | `{ edges[] (from, to) }`                                          |
| `slot_tasks`                   | Run greedy slotter against free/busy and prefs                         | `projectId`, `tasks[]`, `workHours`, `weekendAllowed`                         | `{ schedule[], burnoutRisk, criticalPath[] }`                     |
| `schedule_accountability_call` | Queue a future outbound call via Vapi schedulePlan                     | `userId`, `earliestAt`, `latestAt`                                            | `"ok"`                                                            |
| `send_accountability_email`    | Send nightly progress email instead of phone call                      | `userId`, `subject`, `html`                                                   | `"sent"`                                                          |
| `record_progress`              | Persist actual minutes + completion flag after check-in                | `taskId`, `actualMin`, `status`                                               | `"ok"`                                                            |
| `get_dashboard_snapshot`       | Return live overview, next tasks, burnout status                       | `userId`                                                                      | `{ overview, nextTasks[] }`                                       |
| `suggest_rebalance`            | Compute options when overload / burnout detected                       | `projectId`                                                                   | `{ options[] }`                                                   |
| `cancel_scheduled_call`        | Abort a queued accountability call                                     | `userId`, `callId`                                                            | `"cancelled"`                                                     |
| `log_background_event`         | Silently append a system message to call history                       | `callId`, `content`                                                           | `"logged"`                                                        |
