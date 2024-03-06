import { ReactElement } from "react";
import { observer } from "mobx-react";

import { AppLayout } from "@layouts/app-layout";

import { PageHead } from "@components/core";
import { WorkspaceDashboardView } from "@components/page-views";
import { WorkspaceDashboardHeader } from "@components/headers/workspace-dashboard";

import { NextPageWithLayout } from "@/types/types";

import { useWorkspace } from "@hooks/store";

const WorkspacePage: NextPageWithLayout = observer(() => {
  const { currentWorkspace } = useWorkspace();
  // derived values
  const pageTitle = currentWorkspace?.name ? `${currentWorkspace?.name} - Dashboard` : undefined;

  return (
    <>
      <PageHead title={pageTitle} />
      <WorkspaceDashboardView />
    </>
  );
});

WorkspacePage.getLayout = function getLayout(page: ReactElement) {
  return <AppLayout header={<WorkspaceDashboardHeader />}>{page}</AppLayout>;
};

export default WorkspacePage;
