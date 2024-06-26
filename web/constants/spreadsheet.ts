import { FC } from "react"

import { CalendarCheck2, CalendarClock, CalendarDays, Link2, Paperclip, Signal, Tag, Triangle } from "lucide-react"

import {
    SpreadsheetAssigneeColumn,
    SpreadsheetAttachmentColumn,
    SpreadsheetCreatedOnColumn,
    SpreadsheetCycleColumn,
    SpreadsheetDueDateColumn,
    SpreadsheetEstimateColumn,
    SpreadsheetLabelColumn,
    SpreadsheetLinkColumn,
    SpreadsheetModuleColumn,
    SpreadsheetPriorityColumn,
    SpreadsheetStartDateColumn,
    SpreadsheetStateColumn,
    SpreadsheetSubIssueColumn,
    SpreadsheetUpdatedOnColumn,
} from "@components/issues/issue-layouts/spreadsheet"

import { IIssueDisplayProperties, TIssue, TIssueOrderByOptions } from "@servcy/types"
import { ContrastIcon, DiceIcon, DoubleCircleIcon, LayersIcon, UserGroupIcon } from "@servcy/ui"
import { ISvgIcons } from "@servcy/ui/src/icons/type"

export const SPREADSHEET_PROPERTY_DETAILS: {
    [key: string]: {
        title: string
        ascendingOrderKey: TIssueOrderByOptions
        ascendingOrderTitle: string
        descendingOrderKey: TIssueOrderByOptions
        descendingOrderTitle: string
        icon: FC<ISvgIcons>
        Column: React.FC<{
            issue: TIssue
            onClose: () => void
            onChange: (issue: TIssue, data: Partial<TIssue>, updates: any) => void // eslint-disable-line
            disabled: boolean
        }>
    }
} = {
    assignee: {
        title: "Assignees",
        ascendingOrderKey: "assignees__first_name",
        ascendingOrderTitle: "A",
        descendingOrderKey: "-assignees__first_name",
        descendingOrderTitle: "Z",
        icon: UserGroupIcon,
        Column: SpreadsheetAssigneeColumn,
    },
    created_at: {
        title: "Created on",
        ascendingOrderKey: "-created_at",
        ascendingOrderTitle: "New",
        descendingOrderKey: "created_at",
        descendingOrderTitle: "Old",
        icon: CalendarDays,
        Column: SpreadsheetCreatedOnColumn,
    },
    due_date: {
        title: "Due date",
        ascendingOrderKey: "-target_date",
        ascendingOrderTitle: "New",
        descendingOrderKey: "target_date",
        descendingOrderTitle: "Old",
        icon: CalendarCheck2,
        Column: SpreadsheetDueDateColumn,
    },
    estimate: {
        title: "Estimate",
        ascendingOrderKey: "estimate_point",
        ascendingOrderTitle: "Low",
        descendingOrderKey: "-estimate_point",
        descendingOrderTitle: "High",
        icon: Triangle,
        Column: SpreadsheetEstimateColumn,
    },
    labels: {
        title: "Labels",
        ascendingOrderKey: "labels__name",
        ascendingOrderTitle: "A",
        descendingOrderKey: "-labels__name",
        descendingOrderTitle: "Z",
        icon: Tag,
        Column: SpreadsheetLabelColumn,
    },
    modules: {
        title: "Modules",
        ascendingOrderKey: "modules__name",
        ascendingOrderTitle: "A",
        descendingOrderKey: "-modules__name",
        descendingOrderTitle: "Z",
        icon: DiceIcon,
        Column: SpreadsheetModuleColumn,
    },
    cycle: {
        title: "Cycle",
        ascendingOrderKey: "cycle__name",
        ascendingOrderTitle: "A",
        descendingOrderKey: "-cycle__name",
        descendingOrderTitle: "Z",
        icon: ContrastIcon,
        Column: SpreadsheetCycleColumn,
    },
    priority: {
        title: "Priority",
        ascendingOrderKey: "priority",
        ascendingOrderTitle: "None",
        descendingOrderKey: "-priority",
        descendingOrderTitle: "Urgent",
        icon: Signal,
        Column: SpreadsheetPriorityColumn,
    },
    start_date: {
        title: "Start date",
        ascendingOrderKey: "-start_date",
        ascendingOrderTitle: "New",
        descendingOrderKey: "start_date",
        descendingOrderTitle: "Old",
        icon: CalendarClock,
        Column: SpreadsheetStartDateColumn,
    },
    state: {
        title: "State",
        ascendingOrderKey: "state__name",
        ascendingOrderTitle: "A",
        descendingOrderKey: "-state__name",
        descendingOrderTitle: "Z",
        icon: DoubleCircleIcon,
        Column: SpreadsheetStateColumn,
    },
    updated_at: {
        title: "Updated on",
        ascendingOrderKey: "-updated_at",
        ascendingOrderTitle: "New",
        descendingOrderKey: "updated_at",
        descendingOrderTitle: "Old",
        icon: CalendarDays,
        Column: SpreadsheetUpdatedOnColumn,
    },
    link: {
        title: "Link",
        ascendingOrderKey: "-link_count",
        ascendingOrderTitle: "Most",
        descendingOrderKey: "link_count",
        descendingOrderTitle: "Least",
        icon: Link2,
        Column: SpreadsheetLinkColumn,
    },
    attachment_count: {
        title: "Attachment",
        ascendingOrderKey: "-attachment_count",
        ascendingOrderTitle: "Most",
        descendingOrderKey: "attachment_count",
        descendingOrderTitle: "Least",
        icon: Paperclip,
        Column: SpreadsheetAttachmentColumn,
    },
    sub_issue_count: {
        title: "Sub-issue",
        ascendingOrderKey: "-sub_issues_count",
        ascendingOrderTitle: "Most",
        descendingOrderKey: "sub_issues_count",
        descendingOrderTitle: "Least",
        icon: LayersIcon,
        Column: SpreadsheetSubIssueColumn,
    },
}

export const SPREADSHEET_PROPERTY_LIST: (keyof IIssueDisplayProperties)[] = [
    "state",
    "priority",
    "assignee",
    "labels",
    "modules",
    "cycle",
    "start_date",
    "due_date",
    "estimate",
    "created_at",
    "updated_at",
    "link",
    "attachment_count",
    "sub_issue_count",
]
