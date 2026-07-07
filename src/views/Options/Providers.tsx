import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useI18n } from "../../hooks/I18n";
import Button from "@mui/material/Button";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddIcon from "@mui/icons-material/Add";
import Menu from "@mui/material/Menu";
import React, { useCallback, useEffect, useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import { OPT_ALL_PROVIDER_PRESET } from "../../config/provider";
import {
  ProviderItem,
  useProviderItem,
  useProviderList,
} from "../../hooks/Provider";
import List from "@mui/material/List";
import { ApiListItem, ApiProviderIcon } from "./Apis";
import DeleteIcon from "@mui/icons-material/Delete";
import CodeField from "./CodeField";
import { useConfirm } from "../../hooks/Confirm";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  LanguageDetection,
  MultiStringTranslate,
  SingleStingsTranslate,
} from "../../libs/provider/interfaces";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ProviderFactor from "../../libs/provider/ProviderFactor";

type TestResult = {
  label: string;
  success: boolean;
  content: React.ReactNode;
};

function TestButton({ provider }: { provider: ProviderItem }) {
  const i18n = useI18n();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const handleTest = async () => {
    setOpen(true);
    setResults([]);
    try {
      setLoading(true);
      const testProvider = ProviderFactor.createByProps(provider, false);
      const testResults: TestResult[] = [];
      const text = "The quick brown fox jumps over the lazy dog.";
      const texts = ["The quick brown fox.", "Jumps over the lazy dog."];

      // Test SingleStingsTranslate
      if ("singleStringTranslate" in testProvider) {
        try {
          const translate = await (
            testProvider as SingleStingsTranslate
          ).singleStringTranslate(text, "en", "zh-CN");
          testResults.push({
            label: "singleStringTranslate",
            success: Boolean(translate),
            content: translate ? (
              <Stack spacing={0.5}>
                <Typography variant="body2">{text}</Typography>
                <Typography variant="body2">{translate.translate}</Typography>
              </Stack>
            ) : (
              <pre>empty response</pre>
            ),
          });
        } catch (e) {
          testResults.push({
            label: "singleStringTranslate",
            success: false,
            content: <pre>{e.message || e.toString()}</pre>,
          });
        }
      } else {
        testResults.push({
          label: "singleStringTranslate",
          success: false,
          content: (
            <Typography variant="body2" color="text.secondary">
              {i18n("interface_not_supported")}
            </Typography>
          ),
        });
      }

      // Test MultiStringTranslate
      if ("multiStringTranslate" in testProvider) {
        try {
          const translates = await (
            testProvider as MultiStringTranslate
          ).multiStringTranslate(texts, "en", "zh-CN");
          testResults.push({
            label: "multiStringTranslate",
            success: Boolean(translates?.length),
            content: translates?.length ? (
              <Stack spacing={0.5}>
                {texts.map((item, index) => (
                  <Typography variant="body2" key={item}>
                    {item} - {translates[index]?.translate}
                  </Typography>
                ))}
              </Stack>
            ) : (
              <pre>empty response</pre>
            ),
          });
        } catch (e) {
          testResults.push({
            label: "multiStringTranslate",
            success: false,
            content: <pre>{e.message || e.toString()}</pre>,
          });
        }
      } else {
        testResults.push({
          label: "multiStringTranslate",
          success: false,
          content: (
            <Typography variant="body2" color="text.secondary">
              {i18n("interface_not_supported")}
            </Typography>
          ),
        });
      }

      // Test LanguageDetection
      if ("languageDetection" in testProvider) {
        try {
          const language = await (
            testProvider as LanguageDetection
          ).languageDetection(text);
          testResults.push({
            label: "languageDetection",
            success: Boolean(language),
            content: language ? (
              <Typography variant="body2">
                {text} - {language}
              </Typography>
            ) : (
              <pre>empty response</pre>
            ),
          });
        } catch (e) {
          testResults.push({
            label: "languageDetection",
            success: false,
            content: <pre>{e.message || e.toString()}</pre>,
          });
        }
      } else {
        testResults.push({
          label: "languageDetection",
          success: false,
          content: (
            <Typography variant="body2" color="text.secondary">
              {i18n("interface_not_supported")}
            </Typography>
          ),
        });
      }
      setResults(testResults);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingButton
        size="small"
        variant="outlined"
        loading={loading}
        onClick={handleTest}
      >
        {i18n("test")}
      </LoadingButton>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{i18n("test")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {loading && <Typography variant="body2">Testing...</Typography>}
            {results.map((result) => (
              <Stack key={result.label} spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle2">{result.label}</Typography>
                  <Typography
                    variant="caption"
                    color={result.success ? "success.main" : "error.main"}
                  >
                    {result.success
                      ? i18n("test_success")
                      : i18n("test_failed")}
                  </Typography>
                </Stack>
                {result.content}
                <Divider />
              </Stack>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{i18n("cancel")}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function ProviderFields({ providerId, deleteProvider, copyProvider }) {
  const i18n = useI18n();
  const { provider, updateProvider } = useProviderItem(providerId);
  const confirm = useConfirm();

  useEffect(() => {
    setEditingJson(JSON.stringify(provider, null, 2));
  }, [provider]);

  const [editingJson, setEditingJson] = useState("");

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      confirmText: i18n("delete"),
      cancelText: i18n("cancel"),
    });

    if (isConfirmed) {
      deleteProvider(providerId);
    }
  };

  const handleSave = () => {
    try {
      const json = JSON.parse(editingJson);
      updateProvider(json);
    } catch (error) {
      console.error("Invalid JSON:", error);
    }
  };

  return (
    <Stack direction="column" spacing={2}>
      <CodeField
        // @ts-ignore
        size="small"
        label={"json"}
        value={editingJson}
        onChange={(event) => setEditingJson(event.target.value)}
      />
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        <Button size="small" variant="contained" onClick={handleSave}>
          {i18n("save")}
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => copyProvider(provider)}
        >
          {i18n("copy")}
        </Button>
        <TestButton provider={provider} />
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
        >
          {i18n("delete")}
        </Button>
      </Stack>
    </Stack>
  );
}

export default function Providers() {
  const i18n = useI18n();
  const {
    providers,
    addProvider,
    copyProvider,
    deleteProvider,
    reorderProvider,
  } = useProviderList();

  const [selectedProviderId, setSelectedProviderId] = React.useState("");
  const [draggingProviderId, setDraggingProviderId] = useState("");
  const [dragOverProviderId, setDragOverProviderId] = useState("");

  const handleDragStart = useCallback((event, id) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    setDraggingProviderId(id);
  }, []);

  const handleDragOver = useCallback(
    (event, id) => {
      if (!draggingProviderId || dragOverProviderId === id) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      setDragOverProviderId(id);
    },
    [draggingProviderId, dragOverProviderId]
  );

  const handleDrop = useCallback(
    (event, id) => {
      event.preventDefault();
      const activeId =
        draggingProviderId || event.dataTransfer.getData("text/plain");

      if (activeId && activeId !== id) {
        reorderProvider(activeId, id);
      }

      setDraggingProviderId("");
      setDragOverProviderId("");
    },
    [draggingProviderId, reorderProvider]
  );

  const handleDragEnd = useCallback(() => {
    setDraggingProviderId("");
    setDragOverProviderId("");
  }, []);

  const providerPresets = React.useMemo(() => OPT_ALL_PROVIDER_PRESET, []);

  const providerItems = React.useMemo(
    () => providers.map((provider) => ({ provider })),
    [providers]
  );

  const [addMenuOpen, setAddMenuOpen] = React.useState(false);
  const addButtonRef = React.useRef(null);

  const handleAddMenuToggle = () => {
    setAddMenuOpen((prev) => !prev);
  };

  const handleAddMenuItemClick = (providerItem: ProviderItem) => {
    addProvider(providerItem);
    setAddMenuOpen(false);
  };

  return (
    <Box>
      <Stack spacing={3}>
        <Box>
          <Stack
            direction="row"
            alignContent="center"
            spacing={2}
            useFlexGap
            flexWrap="wrap"
          >
            <Button
              ref={addButtonRef}
              size="small"
              id="app-provider-button"
              variant="contained"
              onClick={handleAddMenuToggle}
              aria-controls={addMenuOpen ? "add-provider-menu" : undefined}
              aria-expanded={addMenuOpen}
              aria-haspopup="true"
              endIcon={<KeyboardArrowDownIcon />}
              startIcon={<AddIcon />}
            >
              {i18n("add")}
            </Button>
          </Stack>
          <Menu
            id="add-provider-menu"
            open={addMenuOpen}
            anchorEl={addButtonRef.current}
            onClose={() => {
              setAddMenuOpen(false);
            }}
            MenuListProps={{
              "aria-labelledby": "add-provider-button",
            }}
          >
            {providerPresets.map((preset) => (
              <MenuItem
                key={preset.type}
                onClick={() => handleAddMenuItemClick(preset)}
                sx={{ gap: 1 }}
              >
                <ApiProviderIcon apiType={preset.icon} />
                <Box component="span" sx={{ flex: 1 }}>
                  {preset.label}
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            overflow: "hidden",
            height: { md: "calc(100vh - 250px)" },
          }}
        >
          <Box
            sx={(theme) => ({
              width: { xs: "100%", md: 280 },
              flex: { xs: "0 0 auto", md: "0 0 280px" },
              height: { md: "100%" },
              overflowY: "auto",
              borderRight: {
                xs: 0,
                md: `1px solid ${theme.palette.divider}`,
              },
              borderBottom: {
                xs: `1px solid ${theme.palette.divider}`,
                md: 0,
              },
            })}
          >
            <List disablePadding>
              {providerItems.map(({ provider }) => (
                <ApiListItem
                  key={provider.id}
                  api={{
                    apiType: provider.icon,
                    apiName: provider.name,
                    isDisabled: !provider.enable,
                  }}
                  selected={provider.id === selectedProviderId}
                  bulkMode={false}
                  checked={false}
                  dragging={provider.id === draggingProviderId}
                  dragOver={provider.id === dragOverProviderId}
                  onSelect={() => setSelectedProviderId(provider.id)}
                  onCheck={() => {}}
                  onDragStart={(event) => handleDragStart(event, provider.id)}
                  onDragOver={(event) => handleDragOver(event, provider.id)}
                  onDrop={(event) => handleDrop(event, provider.id)}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </List>
          </Box>
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              p: 2,
              boxSizing: "border-box",
              height: { md: "100%" },
              overflowY: { md: "auto" },
              scrollbarGutter: { md: "stable" },
              overscrollBehavior: "contain",
            }}
          >
            {selectedProviderId && (
              <ProviderFields
                providerId={selectedProviderId}
                deleteProvider={deleteProvider}
                copyProvider={copyProvider}
              />
            )}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
