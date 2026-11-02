import { createFileRoute } from "@tanstack/react-router";
import { PanelTitle } from "@/components/site/PanelLayout";
import { SettingsPanels } from "@/components/site/SettingsPanels";

export const Route = createFileRoute("/account/settings")({
  component: () => (
    <>
      <PanelTitle title="Настройки" />
      <SettingsPanels />
    </>
  ),
});
