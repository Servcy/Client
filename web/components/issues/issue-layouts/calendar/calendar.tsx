import { observer } from "mobx-react-lite"

import { CalendarHeader, CalendarWeekDays, CalendarWeekHeader } from "@components/issues"

import { useIssues, useUser } from "@hooks/store"
import { useCalendarView } from "@hooks/store/use-calendar-view"

import { ERoles } from "@constants/iam"
import { EIssuesStoreType } from "@constants/issue"

import { ICycleIssuesFilter } from "@store/issue/cycle"
import { IModuleIssuesFilter } from "@store/issue/module"
import { IProjectIssuesFilter } from "@store/issue/project"
import { IProjectViewIssuesFilter } from "@store/issue/project-views"

import { TGroupedIssues, TIssue, TIssueMap } from "@servcy/types"
import { Spinner } from "@servcy/ui"

import { ICalendarWeek } from "./types"

type Props = {
    issuesFilterStore: IProjectIssuesFilter | IModuleIssuesFilter | ICycleIssuesFilter | IProjectViewIssuesFilter
    issues: TIssueMap | undefined
    groupedIssueIds: TGroupedIssues
    layout: "month" | "week" | undefined
    showWeekends: boolean
    quickActions: (issue: TIssue, customActionButton?: React.ReactElement) => React.ReactNode
    quickAddCallback?: (
        workspaceSlug: string,
        projectId: string,
        data: TIssue,
        viewId?: string
    ) => Promise<TIssue | undefined>
    viewId?: string
    readOnly?: boolean
}

export const CalendarChart: React.FC<Props> = observer((props) => {
    const {
        issuesFilterStore,
        issues,
        groupedIssueIds,
        layout,
        showWeekends,
        quickActions,
        quickAddCallback,
        viewId,
        readOnly = false,
    } = props
    // store hooks
    const {
        issues: { viewFlags },
    } = useIssues(EIssuesStoreType.PROJECT)
    const issueCalendarView = useCalendarView()
    const {
        membership: { currentProjectRole },
    } = useUser()

    const { enableIssueCreation } = viewFlags || {}
    const isEditingAllowed = currentProjectRole !== undefined && currentProjectRole >= ERoles.MEMBER

    const calendarPayload = issueCalendarView.calendarPayload

    const allWeeksOfActiveMonth = issueCalendarView.allWeeksOfActiveMonth

    if (!calendarPayload)
        return (
            <div className="grid h-full w-full place-items-center">
                <Spinner />
            </div>
        )

    return (
        <>
            <div className="flex h-full w-full flex-col overflow-hidden">
                <CalendarHeader issuesFilterStore={issuesFilterStore} viewId={viewId} />
                <div className="flex h-full w-full vertical-scrollbar scrollbar-lg flex-col">
                    <CalendarWeekHeader isLoading={!issues} showWeekends={showWeekends} />
                    <div className="h-full w-full">
                        {layout === "month" && (
                            <div className="grid h-full w-full grid-cols-1 divide-y-[0.5px] divide-custom-border-200">
                                {allWeeksOfActiveMonth &&
                                    Object.values(allWeeksOfActiveMonth).map((week: ICalendarWeek, weekIndex) => (
                                        <CalendarWeekDays
                                            issuesFilterStore={issuesFilterStore}
                                            key={weekIndex}
                                            week={week}
                                            issues={issues}
                                            groupedIssueIds={groupedIssueIds}
                                            enableQuickIssueCreate
                                            disableIssueCreation={!enableIssueCreation || !isEditingAllowed}
                                            quickActions={quickActions}
                                            quickAddCallback={quickAddCallback}
                                            viewId={viewId}
                                            readOnly={readOnly}
                                        />
                                    ))}
                            </div>
                        )}
                        {layout === "week" && (
                            <CalendarWeekDays
                                issuesFilterStore={issuesFilterStore}
                                week={issueCalendarView.allDaysOfActiveWeek}
                                issues={issues}
                                groupedIssueIds={groupedIssueIds}
                                enableQuickIssueCreate
                                disableIssueCreation={!enableIssueCreation || !isEditingAllowed}
                                quickActions={quickActions}
                                quickAddCallback={quickAddCallback}
                                viewId={viewId}
                                readOnly={readOnly}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    )
})
