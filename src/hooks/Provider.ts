import { useCallback, useMemo } from "react";
import type { BaseProviderProps } from "../libs/provider/BaseProvider";
import { useSetting } from "./Setting";

type ProviderId = BaseProviderProps["id"];
type ProviderItem = BaseProviderProps;
type Setting = {
  providers?: ProviderItem[];
};
type UpdateSetting = (objOrFn: Setting | ((prev?: Setting) => Setting)) => void;

function normalizeApiOrder(providers: ProviderItem[]): ProviderItem[] {
  return providers.map((provider, index) => ({
    ...provider, sortOrder: index
  }))
}

function useProviderState() {
  const { setting, updateSetting } = useSetting() as {
    setting?: Setting;
    updateSetting: UpdateSetting;
  };
  const providers = useMemo(
    () => setting?.providers || [],
    [setting?.providers]
  );

  return { setting, providers, updateSetting };
}

export function useProviderList() {
  const { providers, updateSetting } = useProviderState();

  const enabledProviders = useMemo(
    () => providers.filter((provider) => provider.enable),
    [providers]
  )

  const addProvider = useCallback(
    (provider: ProviderItem): void => {
      const uuid = crypto.randomUUID();
      const newProvider = {
        ...provider,
        id: uuid,
        name: `${provider.label}_${uuid.slice(0, 8)}`
      }
      updateSetting((prev) => ({
        ...prev,
        providers: [...(prev?.providers || []), newProvider],
      }));
    },
    [updateSetting]
  );

  const copyProvider = useCallback((provider: ProviderItem): void => {
    const uuid = crypto.randomUUID();
    const newProvider = {
      ...provider,
      id: uuid,
      name: `${provider.name} - copy`
    }
    updateSetting((prev) => ({
      ...prev,
      providers: [...(prev?.providers || []), newProvider],
    }))
  }, [updateSetting]);

  const deleteProvider = useCallback(
    (providerId: ProviderId): void => {
      updateSetting((prev) => ({
        ...prev,
        providers: (prev?.providers || []).filter(
          (provider) => provider.id !== providerId
        ),
      }));
    },
    [updateSetting]
  );

  const reorderProvider = useCallback(
    (activeId: ProviderId, overId: ProviderId): void => {
      if (!activeId || !overId || activeId === overId) return;

      updateSetting((prev) => {
        const providers = [...(prev?.providers || [])].sort(
          (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
        );
        const fromIndex = providers.findIndex(
          (provider) => provider.id === activeId
        );
        const toIndex = providers.findIndex(
          (provider) => provider.id === overId
        );

        if (fromIndex < 0 || toIndex < 0) {
          return prev;
        }

        const nextProviders = [...providers];
        const [movedProvider] = nextProviders.splice(fromIndex, 1);
        nextProviders.splice(toIndex, 0, movedProvider);

        return {
          ...prev,
          providers: normalizeApiOrder(nextProviders),
        };
      });
    },
    [updateSetting]
  );

  return {
    providers,
    enabledProviders,
    addProvider,
    copyProvider,
    deleteProvider,
    reorderProvider,
  };
}

export function useProviderItem(providerId: ProviderId) {
  const { providers, updateSetting } = useProviderState();
  const provider = useMemo(
    () => providers.find((item) => item.id === providerId),
    [providers, providerId]
  );

  const updateProvider = useCallback(
    (newData) => {
      updateSetting((prev) => ({
        ...prev,
        providers: (prev?.providers || []).map((provider) =>
          provider.id === providerId
            ? { ...provider, ...newData, id: providerId }
            : provider
        ),
      }));
    },
    [providerId, updateSetting]
  );

  return { provider, updateProvider };
}

export type { ProviderItem, ProviderId };
