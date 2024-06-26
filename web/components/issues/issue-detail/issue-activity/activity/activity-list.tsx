import { FC } from "react"

import { observer } from "mobx-react-lite"

import { useIssueDetail } from "@hooks/store"

import {
    IssueArchivedAtActivity,
    IssueAssigneeActivity,
    IssueAttachmentActivity,
    IssueCycleActivity,
    IssueDefaultActivity,
    IssueDescriptionActivity,
    IssueEstimateActivity,
    IssueGithubActivity,
    IssueLabelActivity,
    IssueLinkActivity,
    IssueModuleActivity,
    IssueNameActivity,
    IssueParentActivity,
    IssuePriorityActivity,
    IssueRelationActivity,
    IssueStartDateActivity,
    IssueStateActivity,
    IssueTargetDateActivity,
} from "./actions"

type TIssueActivityList = {
    activityId: string
    ends: "top" | "bottom" | undefined
}

export const IssueActivityList: FC<TIssueActivityList> = observer((props) => {
    const { activityId, ends } = props

    const {
        activity: { getActivityById },
        comment: {},
    } = useIssueDetail()

    const componentDefaultProps = { activityId, ends }

    const activityField = getActivityById(activityId)?.field
    switch (activityField) {
        case null: // default issue creation
            return <IssueDefaultActivity {...componentDefaultProps} />
        case "state":
            return <IssueStateActivity {...componentDefaultProps} showIssue={false} />
        case "name":
            return <IssueNameActivity {...componentDefaultProps} />
        case "description":
            return <IssueDescriptionActivity {...componentDefaultProps} showIssue={false} />
        case "assignees":
            return <IssueAssigneeActivity {...componentDefaultProps} showIssue={false} />
        case "priority":
            return <IssuePriorityActivity {...componentDefaultProps} showIssue={false} />
        case "estimate_point":
            return <IssueEstimateActivity {...componentDefaultProps} showIssue={false} />
        case "parent":
            return <IssueParentActivity {...componentDefaultProps} showIssue={false} />
        case ["blocking", "blocked_by", "duplicate", "relates_to"].find((field) => field === activityField):
            return <IssueRelationActivity {...componentDefaultProps} />
        case "start_date":
            return <IssueStartDateActivity {...componentDefaultProps} showIssue={false} />
        case "target_date":
            return <IssueTargetDateActivity {...componentDefaultProps} showIssue={false} />
        case "cycles":
            return <IssueCycleActivity {...componentDefaultProps} />
        case "modules":
            return <IssueModuleActivity {...componentDefaultProps} />
        case "labels":
            return <IssueLabelActivity {...componentDefaultProps} showIssue={false} />
        case "link":
            return <IssueLinkActivity {...componentDefaultProps} showIssue={false} />
        case "attachment":
            return <IssueAttachmentActivity {...componentDefaultProps} showIssue={false} />
        case "archived_at":
            return <IssueArchivedAtActivity {...componentDefaultProps} />
        case "github":
            return <IssueGithubActivity {...componentDefaultProps} />
        default:
            return <></>
    }
})
