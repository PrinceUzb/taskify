import { type ReactNode } from "react";
// import { useIssues } from "@/hooks/query-hooks/use-issues";
import {
  Dropdown,
  DropdownContent,
  DropdownGroup,
  DropdownItem,
  DropdownLabel,
  DropdownPortal,
} from "../../components/ui/dropdown-menu";
import {
  Context,
  ContextContent,
  ContextGroup,
  ContextItem,
  ContextLabel,
  ContextPortal,
} from "../../components/ui/context-menu";
import { MenuOptionType } from "../../models/types.interface";
import { Issue } from "../../models/issues.interface";

type MenuOptionsType = {
  actions: MenuOptionType[];
};

const menuOptions: MenuOptionsType = {
  actions: [
    // ONLY DELETE IS IMPLEMENTED
    // { id: "add-flag", label: "Add Flag" },
    // { id: "change-parent", label: "Change Parent" },
    // { id: "copy-issue-link", label: "Copy Issue Link" },
    // { id: "split-issue", label: "Split Issue" },
    { id: "delete", label: "Delete" },
  ],
};

const IssueDropdownMenu: React.FC<{
  children: ReactNode;
  issue: Issue;
}> = ({ children, issue }) => {
  const handleIssueAction = (
    id: MenuOptionType["id"],
    e: React.SyntheticEvent,
    sprintId?: string
  ) => {
    e.stopPropagation();
    if (id == "delete") {
      // deleteIssue({ issueId: issue.id });
    }
    if (id == "move-to") {
    }
  };
  return (
    <Dropdown>
      {children}
      <DropdownPortal>
        <DropdownContent
          side="top"
          sideOffset={5}
          align="end"
          className="min-w-[100px] z-50 w-fit rounded-md border border-gray-300 bg-white pt-2 shadow-md"
        >
          <DropdownLabel className="p-2 text-xs font-normal text-gray-400">
            ACTIONS
          </DropdownLabel>
          <DropdownGroup>
            {menuOptions.actions.map((action) => (
              <DropdownItem
                onClick={(e) => handleIssueAction(action.id, e)}
                key={action.id}
                textValue={action.label}
                className={
                  "border-transparent p-2 text-sm hover:cursor-default hover:bg-gray-100"
                }
              >
                <span className={"pr-2 text-sm"}>{action.label}</span>
              </DropdownItem>
            ))}
          </DropdownGroup>
          {/* TODO: Implement "move to" actions */}
          {/* <DropdownLabel className="p-2 text-xs font-normal text-gray-400">
            MOVE TO
          </DropdownLabel>
          <DropdownGroup>
            {[
              ...(sprints ?? []),
              {
                id: "backlog",
                name: "Backlog",
                key: "backlog",
              },
            ].map((sprint) => (
              <DropdownItem
                onClick={(e) => handleIssueAction("move-to", e, sprint.key)}
                key={sprint.id}
                textValue={sprint.name}
                className={clsx(
                  "border-transparent p-2 text-sm hover:cursor-default hover:bg-gray-100"
                )}
              >
                <span className={clsx("pr-2 text-sm")}>{sprint.name}</span>
              </DropdownItem>
            ))}
          </DropdownGroup> */}
        </DropdownContent>
      </DropdownPortal>
    </Dropdown>
  );
};
const IssueContextMenu: React.FC<{
  children: ReactNode;
  isEditing: boolean;
  className?: string;
}> = ({ children, isEditing, className }) => {
  return (
    <div
      data-state={isEditing ? "editing" : "not-editing"}
      className={clsx("flex [&[data-state=editing]]:hidden", className)}
    >
      <Context>
        {children}
        <ContextPortal>
          <ContextContent className="min-w-[100px] w-fit rounded-md border border-gray-300 bg-white pt-2 shadow-md">
            <ContextLabel className="p-2 text-xs font-normal text-gray-400">
              ACTIONS
            </ContextLabel>
            <ContextGroup>
              {menuOptions.actions.map((action) => (
                <ContextItem
                  key={action.id}
                  textValue={action.label}
                  className={clsx(
                    "border-transparent p-2 text-sm hover:cursor-default hover:bg-gray-100"
                  )}
                >
                  <span className={clsx("pr-2 text-sm")}>{action.label}</span>
                </ContextItem>
              ))}
            </ContextGroup>
          </ContextContent>
        </ContextPortal>
      </Context>
    </div>
  );
};

export { IssueDropdownMenu, IssueContextMenu };
