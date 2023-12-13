import { priorityAccounts } from "../config.mts";
import { ChannelInfo } from "../../types.mts";

export function isHighPriorityChannel(channel: ChannelInfo) {
  const isPriorityAccount = priorityAccounts.includes(channel.datasetUser.toLowerCase())

  return isPriorityAccount
}