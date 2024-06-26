import { FC } from "react"

import { MessageSquare } from "lucide-react"
import { observer } from "mobx-react"

import { useIssueDetail } from "@hooks/store"

import { IssueActivityBlockComponent, IssueLink } from "./"

type TIssueDescriptionActivity = { activityId: string; showIssue?: boolean; ends: "top" | "bottom" | undefined }

export const IssueDescriptionActivity: FC<TIssueDescriptionActivity> = observer((props) => {
    const { activityId, showIssue = true, ends } = props

    const {
        activity: { getActivityById },
    } = useIssueDetail()

    const activity = getActivityById(activityId)

    if (!activity) return <></>
    return (
        <IssueActivityBlockComponent
            icon={<MessageSquare size={14} color="#6b7280" aria-hidden="true" />}
            activityId={activityId}
            ends={ends}
        >
            <>
                updated the description
                {showIssue ? ` of ` : ``}
                {showIssue && <IssueLink activityId={activityId} />}.
            </>
        </IssueActivityBlockComponent>
    )
})
