import { FC } from "react"

import { ArchiveRestoreIcon } from "lucide-react"
import { observer } from "mobx-react"

import { useIssueDetail } from "@hooks/store"

import { ArchiveIcon } from "@servcy/ui"

import { IssueActivityBlockComponent } from "./"

type TIssueArchivedAtActivity = { activityId: string; ends: "top" | "bottom" | undefined }

export const IssueArchivedAtActivity: FC<TIssueArchivedAtActivity> = observer((props) => {
    const { activityId, ends } = props

    const {
        activity: { getActivityById },
    } = useIssueDetail()

    const activity = getActivityById(activityId)

    if (!activity) return <></>

    return (
        <IssueActivityBlockComponent
            icon={
                activity.new_value === "restore" ? (
                    <ArchiveRestoreIcon className="h-3.5 w-3.5" color="#6b7280" aria-hidden="true" />
                ) : (
                    <ArchiveIcon className="h-3.5 w-3.5" color="#6b7280" aria-hidden="true" />
                )
            }
            activityId={activityId}
            ends={ends}
            customUserName={activity.new_value === "archive" ? "Servcy" : undefined}
        >
            {activity.new_value === "restore" ? "restored the issue" : "archived the issue"}.
        </IssueActivityBlockComponent>
    )
})
