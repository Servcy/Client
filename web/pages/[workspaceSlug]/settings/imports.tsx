import { observer } from "mobx-react-lite";

import { useUser, useWorkspace } from "@hooks/store";

import { WorkspaceSettingLayout } from "@layouts/settings-layout";
import { AppLayout } from "@layouts/app-layout";

import IntegrationGuide from "@components/integration/guide";
import { WorkspaceSettingHeader } from "@components/headers";
import { PageHead } from "@components/core";

import { NextPageWithLayout } from "@/types/types";

import { EUserWorkspaceRoles } from "@constants/workspace";

const ImportsPage: NextPageWithLayout = observer(() => {
  // store hooks
  const {
    membership: { currentWorkspaceRole },
  } = useUser();
  const { currentWorkspace } = useWorkspace();

  // derived values
  const isAdmin = currentWorkspaceRole === EUserWorkspaceRoles.ADMIN;
  const pageTitle = currentWorkspace?.name ? `${currentWorkspace.name} - Imports` : undefined;

  if (!isAdmin)
    return (
      <>
        <PageHead title={pageTitle} />
        <div className="mt-10 flex h-full w-full justify-center p-4">
          <p className="text-sm text-custom-text-300">You are not authorized to access this page.</p>
        </div>
      </>
    );

  return (
    <>
      <PageHead title={pageTitle} />
      <section className="w-full overflow-y-auto py-8 pr-9">
        <div className="flex items-center border-b border-custom-border-100 py-3.5">
          <h3 className="text-xl font-medium">Imports</h3>
        </div>
        <IntegrationGuide />
      </section>
    </>
  );
});

ImportsPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <AppLayout header={<WorkspaceSettingHeader title="Import Settings" />}>
      <WorkspaceSettingLayout>{page}</WorkspaceSettingLayout>
    </AppLayout>
  );
};

export default ImportsPage;
