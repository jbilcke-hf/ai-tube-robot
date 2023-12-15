import { bannedAccounts } from "../config.mts";
import { ChannelInfo } from "../../types.mts";

// used to determine if a user is known for regularly posting bad content
export function isOwnedByBadActor(channel: ChannelInfo) {
  const isBannedAccount = bannedAccounts.includes(channel.datasetUser.toLowerCase())

  return isBannedAccount
}