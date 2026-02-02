import { ID } from "appwrite";
import { account } from "./appwrite";

/**
 * Create a new Appwrite user (does NOT log them in).
 *
 * @param {string} args.email - User email address.
 * @param {string} args.password - Plaintext password (must meet your Appwrite policy).
 * @param {string} args.name - Display name to store on the user.
 * @returns {Promise<import('appwrite').Models.User<import('appwrite').Models.Preferences>>}
 * @throws {Error} If validation fails or the email already exists.
 *
 * Notes:
 * - Call `signIn` after this if you want to start a session immediately.
 *
 * Example:
 * await signUp({ email, password, name });
 */
export function signUp({ email, password, name }) {
  return account.create(ID.unique(), email, password, name);
}

/**
 * Create an email/password session (logs the user in on this client).
 *
 * @param {Object} args
 * @param {string} args.email
 * @param {string} args.password
 * @returns {Promise<import('appwrite').Models.Session>}
 * @throws {Error} If credentials are invalid or requests are rate-limited.
 *
 * Example:
 * const session = await signIn({ email, password });
 */
export function signIn({ email, password }) {
  return account.createEmailPasswordSession(email, password);
}

/**
 * Fetch the currently authenticated user for this client/session.
 *
 * @returns {Promise<import('appwrite').Models.User<import('appwrite').Models.Preferences>>}
 * @throws {Error} If there is no active session.
 *
 * Example:
 * const me = await getCurrentUser();
 */
export function getCurrentUser() {
  return account.get();
}

/**
 * Log out the current session on this client.
 *
 * @returns {Promise<void|object>} Resolves when the session is deleted.
 * @throws {Error} If no current session exists.
 *
 * Example:
 * await signOut();
 */
export function signOut() {
  return account.deleteSession("current");
}
