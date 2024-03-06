import { FC, useCallback } from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";

import { CalendarChart } from "@components/issues";
import toast from "react-hot-toast";

import { TGroupedIssues, TIssue } from "@servcy/types";
import { IQuickActionProps } from "../list/list-view-types";
import { EIssueActions } from "../types";
import { handleDragDrop } from "./utils";
import { useIssues, useUser } from "@hooks/store";
import { ICycleIssues, ICycleIssuesFilter } from "@store/issue/cycle";
import { IModuleIssues, IModuleIssuesFilter } from "@store/issue/module";
import { IProjectIssues, IProjectIssuesFilter } from "@store/issue/project";
import { IProjectViewIssues, IProjectViewIssuesFilter } from "@store/issue/project-views";
import { EUserProjectRoles } from "@constants/project";

interface IBaseCalendarRoot {
  issueStore: IProjectIssues | IModuleIssues | ICycleIssues | IProjectViewIssues;
  issuesFilterStore: IProjectIssuesFilter | IModuleIssuesFilter | ICycleIssuesFilter | IProjectViewIssuesFilter;
  QuickActions: FC<IQuickActionProps>;
  issueActions: {
    [EIssueActions.DELETE]: (issue: TIssue) => Promise<void>;
    [EIssueActions.UPDATE]?: (issue: TIssue) => Promise<void>;
    [EIssueActions.REMOVE]?: (issue: TIssue) => Promise<void>;
    [EIssueActions.ARCHIVE]?: (issue: TIssue) => Promise<void>;
    [EIssueActions.RESTORE]?: (issue: TIssue) => Promise<void>;
  };
  viewId?: string;
  isCompletedCycle?: boolean;
}

export const BaseCalendarRoot = observer((props: IBaseCalendarRoot) => {
  const { issueStore, issuesFilterStore, QuickActions, issueActions, viewId, isCompletedCycle = false } = props;

  // router
  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;

  const { issueMap } = useIssues();
  const {
    membership: { currentProjectRole },
  } = useUser();

  const isEditingAllowed = !!currentProjectRole && currentProjectRole >= EUserProjectRoles.MEMBER;

  const displayFilters = issuesFilterStore.issueFilters?.displayFilters;

  const groupedIssueIds = (issueStore.groupedIssueIds ?? {}) as TGroupedIssues;

  const onDragEnd = async (result: DropResult) => {
    if (!result) return;

    // return if not dropped on the correct place
    if (!result.destination) return;

    // return if dropped on the same date
    if (result.destination.droppableId === result.source.droppableId) return;

    if (handleDragDrop) {
      await handleDragDrop(
        result.source,
        result.destination,
        workspaceSlug?.toString(),
        projectId?.toString(),
        issueStore,
        issueMap,
        groupedIssueIds,
        viewId
      ).catch((err) => {
        toast.error({
          title: "Error",
          type: "error",
          message: err.detail ?? "Failed to perform this action",
        });
      });
    }
  };

  const handleIssues = useCallback(
    async (date: string, issue: TIssue, action: EIssueActions) => {
      if (issueActions[action]) {
        await issueActions[action]!(issue);
      }
    },
    [issueActions]
  );

  return (
    <>
      <div className="h-full w-full overflow-hidden bg-custom-background-100 pt-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <CalendarChart
            issuesFilterStore={issuesFilterStore}
            issues={issueMap}
            groupedIssueIds={groupedIssueIds}
            layout={displayFilters?.calendar?.layout}
            showWeekends={displayFilters?.calendar?.show_weekends ?? false}
            quickActions={(issue, customActionButton) => (
              <QuickActions
                customActionButton={customActionButton}
                issue={issue}
                handleDelete={async () => handleIssues(issue.target_date ?? "", issue, EIssueActions.DELETE)}
                handleUpdate={
                  issueActions[EIssueActions.UPDATE]
                    ? async (data) => handleIssues(issue.target_date ?? "", data, EIssueActions.UPDATE)
                    : undefined
                }
                handleRemoveFromView={
                  issueActions[EIssueActions.REMOVE]
                    ? async () => handleIssues(issue.target_date ?? "", issue, EIssueActions.REMOVE)
                    : undefined
                }
                handleArchive={
                  issueActions[EIssueActions.ARCHIVE]
                    ? async () => handleIssues(issue.target_date ?? "", issue, EIssueActions.ARCHIVE)
                    : undefined
                }
                handleRestore={
                  issueActions[EIssueActions.RESTORE]
                    ? async () => handleIssues(issue.target_date ?? "", issue, EIssueActions.RESTORE)
                    : undefined
                }
                readOnly={!isEditingAllowed || isCompletedCycle}
              />
            )}
            quickAddCallback={issueStore.quickAddIssue}
            viewId={viewId}
            readOnly={!isEditingAllowed || isCompletedCycle}
          />
        </DragDropContext>
      </div>
    </>
  );
});
