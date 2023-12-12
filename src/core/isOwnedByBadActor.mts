import { bannedAccounts, priorityAccounts } from "../config.mts";
import { ChannelInfo } from "../types.mts";

export function isOwnedByBadActor(channel: ChannelInfo) {
  const isBannedAccount = bannedAccounts.includes(channel.datasetUser.toLowerCase())

  return isBannedAccount
}