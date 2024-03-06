import { ReactElement } from "react";
import { observer } from "mobx-react";
// layouts
import { AppLayout } from "@layouts/app-layout";
import { ProjectSettingLayout } from "@layouts/settings-layout";
// components
import { PageHead } from "components/core";
import { ProjectSettingsLabelList } from "components/labels";
import { ProjectSettingHeader } from "components/headers";
// types
import { NextPageWithLayout } from "@lib/types";
// hooks
import { useProject } from "@hooks/store";

const LabelsSettingsPage: NextPageWithLayout = observer(() => {
  const { currentProjectDetails } = useProject();
  const pageTitle = currentProjectDetails?.name ? `${currentProjectDetails?.name} - Labels` : undefined;

  return (
    <>
      <PageHead title={pageTitle} />
      <div className="h-full w-full gap-10 overflow-y-auto py-8 pr-9">
        <ProjectSettingsLabelList />
      </div>
    </>
  );
});

LabelsSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout withProjectWrapper header={<ProjectSettingHeader title="Labels Settings" />}>
      <ProjectSettingLayout>{page}</ProjectSettingLayout>
    </AppLayout>
  );
};

export default LabelsSettingsPage;
