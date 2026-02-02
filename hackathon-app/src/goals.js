import { ID, Query, Permission, Role } from "appwrite";
import { account, databases } from "./appwrite";

const DB_ID = import.meta.env.VITE_DB_ID;
const COL_GOALS = import.meta.env.VITE_COL_GOALS;

/**
 * Create a new "goal" document owned by the current user.
 *
 * @param {string} title                - Short goal title. Must match collection attribute `title`.
 * @param {string} [description]        - Optional details (`description`).
 * @param {number} [hours_pw]           - Hours per week (integer)
 * @param {string} [experience_level] - Optional prior experience (string format)
 * @returns {Promise<import("appwrite").Models.Document>} The created goal document.
 * @throws {Error} If there is no active session or Appwrite validation fails.
 *
 * Notes:
 * - Requires collection attributes: `title`, `description`, `hours_pw`, `status`, `owner`, `experience_level`.
 * - Sets `status: "active"` by default 
 * - Applies per-document permissions so only the current user can read/update/delete.
 * - Caller must be authenticated (uses `account.get()` to resolve the owner).
 *
 * Example:
 * const doc = await createGoal({ title: "Learn React", hours_pw: 6 });
 * console.log(doc.$id);
 */
export async function createGoal({ title, description, hours_pw, experience_level }) {
  const user = await account.get();            // current session's user
  const userId = user.$id;

  return databases.createDocument(
    DB_ID,
    COL_GOALS,
    ID.unique(),
    {
      title,
      description,
      hours_pw,
      status: "active",
      owner: userId,
      experience_level,
    },
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
      Permission.write(Role.user(userId)),    
    ]
  );
}

/**
 * List the current user's goals, newest first.
 *
 * @returns {Promise<import("appwrite").Models.DocumentList<import("appwrite").Models.Document>>}
 * @throws {Error} If there is no active session.
 *
 * Notes:
 * - Filters by the custom `owner` attribute (must equal the current user's $id).
 * - Sorts by `$createdAt` descending.
 *
 * Example:
 * const list = await listMyGoals();
 * for (const doc of list.documents) console.log(doc.title);
 */
export async function listMyGoals() {
  const { $id: userId } = await account.get();
  return databases.listDocuments(DB_ID, COL_GOALS, [
    Query.equal("owner", userId),            // matches your current usage; ensure types match your attribute
    Query.orderDesc("$createdAt"),
  ]);
}

/**
 * Fetch a single goal document by id.
 *
 * @param {string} id - Document $id.
 * @returns {Promise<import("appwrite").Models.Document>}
 * @throws {Error} If the document does not exist or the caller lacks read permission.
 *
 * Example:
 * const goal = await getGoal(goalId);
 */
export function getGoal(id) {
  return databases.getDocument(DB_ID, COL_GOALS, id);
}

/**
 * Partially update a goal document.
 *
 * @param {string} id    - Document $id.
 * @param {Object} patch - Fields to update (must match attribute names and types).
 * @returns {Promise<import("appwrite").Models.Document>} The updated document.
 * @throws {Error} If validation fails or the caller lacks update permission.
 *
 * Notes:
 * - Only include attributes that exist in the collection. Arrays are replaced (not merged).
 * - To clear a value, set it to `null` only if the attribute is nullable.
 *
 * Example:
 * await updateGoal(goalId, { status: "paused", hours_pw: 4 });
 */
export function updateGoal(id, patch) {
  return databases.updateDocument(DB_ID, COL_GOALS, id, patch);
}

/**
 * Delete a goal document by id.
 *
 * @param {string} id - Document $id.
 * @returns {Promise<void|object>} Resolves when deletion completes.
 * @throws {Error} If the caller lacks delete permission.
 *
 * Notes:
 * - If weekly goals are related via a relationship with "On Delete: CASCADE", they will be removed automatically.
 * - Otherwise, delete related children first to avoid orphans.
 *
 * Example:
 * await deleteGoal(goalId);
 */
export function deleteGoal(id) {
  return databases.deleteDocument(DB_ID, COL_GOALS, id);
}
