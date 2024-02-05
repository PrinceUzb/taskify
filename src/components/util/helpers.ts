import { Issue, IssueType } from "../../models/issues.interface";
import { IssueCountType } from "../../models/types.interface";

export function getBaseUrl() {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
}

export function getHeaders() {
  return {
    "Content-type": "application/json",
  };
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function capitalizeMany(str: string) {
  return str
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

export function getIssueCountByStatus(issues: Issue[]) {
  return issues.reduce(
    (acc, issue) => {
      acc[issue.status]++;
      return acc;
    },
    {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
    } as IssueCountType
  );
}

export function isEpic(issue: Issue) {
  if (!issue) return false;
  return issue.type == IssueType.EPIC;
}

export function isSubtask(issue: Issue | null) {
  if (!issue) return false;
  return issue.type == IssueType.SUBTASK;
}

export function sprintId(id: string | null | undefined) {
  return id == "backlog" ? null : id;
}

export function isNullish<T>(
  value: T | null | undefined
): value is null | undefined {
  return value == null || value == undefined;
}

export function issueNotInSearch({
  issue,
  search,
}: {
  issue: Issue;
  search: string;
}) {
  return (
    search.length &&
    !(
      issue.name.toLowerCase().includes(search.toLowerCase()) ||
      issue.assigneeId?.toLowerCase().includes(search.toLowerCase()) ||
      issue.key.toLowerCase().includes(search.toLowerCase())
    )
  );
}

export function assigneeNotInFilters({
  issue,
  assignees,
}: {
  issue: Issue;
  assignees: string[];
}) {
  return (
    assignees.length && !assignees.includes(issue.assigneeId ?? "unassigned")
  );
}

export function epicNotInFilters({
  issue,
  epics,
}: {
  issue: Issue;
  epics: string[];
}) {
  return epics.length && (!issue.parentId || !epics.includes(issue.parentId));
}

export function IssueNotInFilters({
  issue,
  Issues,
}: {
  issue: Issue;
  Issues: string[];
}) {
  return Issues.length && !Issues.includes(issue.type);
}

export function issueSprintNotInFilters({
  issue,
  sprintIds,
  excludeBacklog = false,
}: {
  issue: Issue;
  sprintIds: string[];
  excludeBacklog?: boolean;
}) {
  if (isNullish(issue.sprintId)) {
    if (sprintIds.length && excludeBacklog) return true;
    return false;
  }
  return sprintIds.length && !sprintIds.includes(issue.sprintId);
}

export function dateToLongString(date: Date) {
  const dateString = new Date(date).toDateString();
  const timeStirng = new Date(date).toLocaleTimeString();

  return dateString + " at " + timeStirng;
}

export function isDone(issue: Issue) {
  return issue.status == "DONE";
}

export function hexToRgba(hex: string | null, opacity?: number) {
  if (!hex) return "rgba(0, 0, 0, 0)";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity ?? 1})`;
}

export function calculateInsertPosition(issues: Issue[]) {
  return Math.max(...issues.map((issue) => issue.sprintPosition), 0) + 1;
}

export function moveItemWithinArray<T>(arr: T[], item: T, newIndex: number) {
  const arrClone = [...arr];
  const oldIndex = arrClone.indexOf(item);
  const oldItem = arrClone.splice(oldIndex, 1)[0];
  if (oldItem) arrClone.splice(newIndex, 0, oldItem);
  return arrClone;
}

export function insertItemIntoArray<T>(arr: T[], item: T, index: number) {
  const arrClone = [...arr];
  arrClone.splice(index, 0, item);
  return arrClone;
}

export function getPluralEnd<T>(arr: T[]) {
  return arr.length > 1 ? "s" : "";
}
