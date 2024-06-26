import React from "react"

import { observer } from "mobx-react-lite"

import { FilterHeader, FilterOption } from "@components/issues"

type TFilterApprovalType = {
    is_approved: boolean | undefined
    handleUpdate: (val?: boolean) => void
}

export const FilterApprovalType: React.FC<TFilterApprovalType> = observer((props) => {
    const { is_approved, handleUpdate } = props

    const [previewEnabled, setPreviewEnabled] = React.useState(true)

    return (
        <>
            <FilterHeader
                title="Approval Status"
                isPreviewEnabled={previewEnabled}
                handleIsPreviewEnabled={() => setPreviewEnabled(!previewEnabled)}
            />
            {previewEnabled && (
                <div>
                    <FilterOption
                        isChecked={is_approved === undefined ? true : false}
                        onClick={() => handleUpdate(undefined)}
                        title={"All"}
                        multiple={false}
                    />
                    <FilterOption
                        isChecked={is_approved === true ? true : false}
                        onClick={() => handleUpdate(true)}
                        title={"Approved"}
                        multiple={false}
                    />
                    <FilterOption
                        isChecked={is_approved === false ? true : false}
                        onClick={() => handleUpdate(false)}
                        title={"Under Review"}
                        multiple={false}
                    />
                </div>
            )}
        </>
    )
})
