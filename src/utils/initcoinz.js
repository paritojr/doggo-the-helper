import { coinz } from "../db.js";
const balances = coinz;
const STARTING_BALANCE = 1000;

export function initCoinz(userId) {
    if (!balances.has(userId)) {
        balances.set(userId, STARTING_BALANCE);
    }
}