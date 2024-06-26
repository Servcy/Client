import { FC } from "react"

import { observer } from "mobx-react"

import { useIssueDetail } from "@hooks/store"

import { DiceIcon } from "@servcy/ui"

import { IssueActivityBlockComponent } from "./"

type TIssueModuleActivity = { activityId: string; ends: "top" | "bottom" | undefined }

export const IssueModuleActivity: FC<TIssueModuleActivity> = observer((props) => {
    const { activityId, ends } = props

    const {
        activity: { getActivityById },
    } = useIssueDetail()

    const activity = getActivityById(activityId)

    if (!activity) return <></>
    return (
        <IssueActivityBlockComponent
            icon={<DiceIcon className="h-4 w-4 flex-shrink-0 text-[#6b7280]" />}
            activityId={activityId}
            ends={ends}
        >
            <>
                {activity.verb === "created" ? (
                    <>
                        <span>added this issue to the module </span>
                        <a
                            href={`/${activity.workspace_detail?.slug}/projects/${activity.project}/modules/${activity.new_identifier}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 truncate font-medium text-custom-text-100 hover:underline"
                        >
                            <span className="truncate">{activity.new_value}</span>
                        </a>
                    </>
                ) : activity.verb === "updated" ? (
                    <>
                        <span>set the module to </span>
                        <a
                            href={`/${activity.workspace_detail?.slug}/projects/${activity.project}/modules/${activity.new_identifier}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 truncate font-medium text-custom-text-100 hover:underline"
                        >
                            <span className="truncate"> {activity.new_value}</span>
                        </a>
                    </>
                ) : (
                    <>
                        <span>removed the issue from the module </span>
                        <a
                            href={`/${activity.workspace_detail?.slug}/projects/${activity.project}/modules/${activity.old_identifier}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 truncate font-medium text-custom-text-100 hover:underline"
                        >
                            <span className="truncate"> {activity.old_value}</span>
                        </a>
                    </>
                )}
            </>
        </IssueActivityBlockComponent>
    )
})
