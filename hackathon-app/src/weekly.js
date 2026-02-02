// db.weeklyGoals.js
import { databases, ID, Permission, Role, Query } from "./appwrite";

export const DB_ID = import.meta.env.VITE_DB_ID;
export const COL_WEEKLY = import.meta.env.VITE_COL_WEEKLY_GOALS;

// Attribute keys — must exactly match your Appwrite collection
const ATTR_TITLE = "title";
const ATTR_DESC  = "description";
const ATTR_DUE   = "due_date";  // Appwrite datetime attribute
const ATTR_REL   = "mainGoal";  // Relationship → main goals

/**
 * Convert Date|string → ISO 8601 string for Appwrite datetime attributes.
 * @param {Date|string|undefined|null} d
 * @returns {string|undefined}
 */
function toISO(d) {
  if (!d) return undefined;
  return typeof d === "string" ? d : new Date(d).toISOString();
}

/**
 * Create a weekly goal linked to a main goal.
 *
 * @param {Object} args
 * @param {string} args.mainGoalId     - Parent goal document $id (stored in relationship `mainGoal`).
 * @param {string} args.title          - Weekly goal title (`title`).
 * @param {string} [args.description]  - Optional details (`description`).
 * @param {Date|string} [args.dueDate] - Due date; JS Date or ISO string; saved to `due_date`.
 * @returns {Promise<import("appwrite").Models.Document>} The created document.
 * @throws {Error} If required fields are missing or Appwrite validation fails.
 *
 * Notes:
 * - Field names must match collection attributes: `title`, `description`, `due_date`, `mainGoal`.
 * - Relationship value is the parent goal’s `$id`.
 * - Caller must have create permission on the collection (or use a server key/function).
 *
 * Example:
 * await createWeeklyGoal(
 *   { mainGoalId, title: "Week 1", description: "Basics", dueDate: "2025-08-18" },
 *   { userId }
 * );
 */
export async function createWeeklyGoal( { mainGoalId, title, description, dueDate },) 
{
  if (!mainGoalId) throw new Error("createWeeklyGoal: mainGoalId required");
  if (!title)      throw new Error("createWeeklyGoal: title required");

  const data = {
    [ATTR_TITLE]: title,
    [ATTR_DESC]: description ?? "",
    [ATTR_DUE]: toISO(dueDate),    // must be ISO for Appwrite datetime
    [ATTR_REL]: mainGoalId,        // relationship stores the parent doc $id
  };

  // Optional per-document permissions
  let perms = opts.permissions;
  if (!perms && opts.userId) {
    perms = [
      Permission.read(Role.user(opts.userId)),
      Permission.update(Role.user(opts.userId)),
      Permission.delete(Role.user(opts.userId)),
      Permission.write(Role.user(opts.userId)), // optional
    ];
  }

  return databases.createDocument(DB_ID, COL_WEEKLY, ID.unique(), data, perms);
}

/**
 * Partially update a weekly goal.
 *
 * @param {string} weeklyId - Document $id in `weekly_goals`.
 * @param {Object} patch    - Fields to update; keys must match collection attributes.
 *   Supported friendly keys (auto-mapped): `title`, `description`, `dueDate`, `mainGoalId`.
 * @returns {Promise<import("appwrite").Models.Document>} Updated document.
 * @throws {Error} If `weeklyId` is missing or validation/permissions fail.
 *
 * Notes:
 * - Arrays are replaced, not merged.
 * - `dueDate` may be Date or ISO; stored as ISO in `due_date`.
 *
 * Example:
 * await updateWeeklyGoal(id, { title: "Week 1 revised", dueDate: new Date() });
 */
export function updateWeeklyGoal(weeklyId, patch) {
  if (!weeklyId) throw new Error("updateWeeklyGoal: weeklyId required");
  const mapped = { ...patch };

  // Map friendly → attribute names
  if ("dueDate" in mapped)      { mapped[ATTR_DUE]   = toISO(mapped.dueDate); delete mapped.dueDate; }
  if ("title" in mapped)        { mapped[ATTR_TITLE] = mapped.title;          delete mapped.title; }
  if ("description" in mapped)  { mapped[ATTR_DESC]  = mapped.description;    delete mapped.description; }
  if ("mainGoalId" in mapped)   { mapped[ATTR_REL]   = mapped.mainGoalId;     delete mapped.mainGoalId; }

  return databases.updateDocument(DB_ID, COL_WEEKLY, weeklyId, mapped);
}

/**
 * Fetch one weekly goal by id.
 *
 * @param {string} weeklyId - Document $id.
 * @returns {Promise<import("appwrite").Models.Document>}
 * @throws {Error} If the document does not exist or the caller lacks read permission.
 *
 * Example:
 * const doc = await getWeeklyGoal(weeklyId);
 */
export function getWeeklyGoal(weeklyId) {
  if (!weeklyId) throw new Error("getWeeklyGoal: weeklyId required");
  return databases.getDocument(DB_ID, COL_WEEKLY, weeklyId);
}

/**
 * List weekly goals for a given main goal, sorted by due date.
 *
 * @param {string} mainGoalId
 * @param {Object} [opts]
 * @param {number} [opts.limit=100]
 * @param {"asc"|"desc"} [opts.order="asc"]
 * @param {string} [opts.cursor] - For pagination (use last `$id` of previous page).
 * @returns {Promise<import("appwrite").Models.DocumentList<import("appwrite").Models.Document>>}
 *
 * Example:
 * const page = await listWeeklyGoalsForGoal(goalId, { order: "asc", limit: 20 });
 */
export function listWeeklyGoalsForGoal(mainGoalId, { limit = 100, order = "asc", cursor } = {}) {
  if (!mainGoalId) throw new Error("listWeeklyGoalsForGoal: mainGoalId required");
  const q = [
    Query.equal(ATTR_REL, [mainGoalId]),
    Query.limit(limit),
    order === "asc" ? Query.orderAsc(ATTR_DUE) : Query.orderDesc(ATTR_DUE),
  ];
  if (cursor) q.push(Query.cursorAfter(cursor));
  return databases.listDocuments(DB_ID, COL_WEEKLY, q);
}

/**
 * Delete one weekly goal.
 *
 * @param {string} weeklyId - Document $id.
 * @returns {Promise<void|object>}
 * @throws {Error} If caller lacks delete permission.
 *
 * Example:
 * await deleteWeeklyGoal(weeklyId);
 */
export function deleteWeeklyGoal(weeklyId) {
  if (!weeklyId) throw new Error("deleteWeeklyGoal: weeklyId required");
  return databases.deleteDocument(DB_ID, COL_WEEKLY, weeklyId);
}
