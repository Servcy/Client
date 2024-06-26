import { FC } from "react"

import { LayoutPanelTop } from "lucide-react"
import { observer } from "mobx-react"

import { useIssueDetail } from "@hooks/store"

import { IssueActivityBlockComponent, IssueLink } from "./"

type TIssueParentActivity = { activityId: string; showIssue?: boolean; ends: "top" | "bottom" | undefined }

export const IssueParentActivity: FC<TIssueParentActivity> = observer((props) => {
    const { activityId, showIssue = true, ends } = props

    const {
        activity: { getActivityById },
    } = useIssueDetail()

    const activity = getActivityById(activityId)

    if (!activity) return <></>
    return (
        <IssueActivityBlockComponent
            icon={<LayoutPanelTop size={14} color="#6b7280" aria-hidden="true" />}
            activityId={activityId}
            ends={ends}
        >
            <>
                {activity.new_value ? `set the parent to ` : `removed the parent `}
                {activity.new_value ? (
                    <span className="font-medium text-custom-text-100">{activity.new_value}</span>
                ) : (
                    <span className="font-medium text-custom-text-100">{activity.old_value}</span>
                )}
                {showIssue && (activity.new_value ? ` for ` : ` from `)}
                {showIssue && <IssueLink activityId={activityId} />}.
            </>
        </IssueActivityBlockComponent>
    )
})
