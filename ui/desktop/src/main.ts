import type { OpenDialogOptions, OpenDialogReturnValue } from 'electron';
import {
  app,
  App,
  BrowserWindow,
  dialog,
  globalShortcut,
  ipcMain,
  Menu,
  MenuItem,
  net,
  Notification,
  powerSaveBlocker,
  screen,
  session,
  shell,
  Tray,
} from 'electron';
import { pathToFileURL, format as formatUrl, URLSearchParams } from 'node:url';
import { Buffer } from 'node:buffer';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import started from 'electron-squirrel-startup';
import path from 'node:path';
import os from 'node:os';
import { execFileSync, spawn, execFile } from 'child_process';
import 'dotenv/config';
import { checkServerStatus } from './goosed';
import { startGoosed } from './goosed';
import { createClient, createConfig } from './api/client';
import { expandTilde } from './utils/pathUtils';
import log from './utils/logger';
import { ensureWinShims } from './utils/winShims';
import { addRecentDir, loadRecentDirs } from './utils/recentDirs';
import { formatAppName, errorMessage, formatErrorForLogging } from './utils/conversionUtils';
import type { Settings, SettingKey } from './utils/settings';
import { defaultSettings, getKeyboardShortcuts } from './utils/settings';
import * as crypto from 'crypto';
import * as yaml from 'yaml';
import windowStateKeeper from 'electron-window-state';
import {
  getUpdateAvailable,
  registerUpdateIpcHandlers,
  setTrayRef,
  setupAutoUpdater,
  updateTrayMenu,
} from './utils/autoUpdater';
import { UPDATES_ENABLED } from './updates';
import './utils/recipeHash';
import { Client } from './api/client';
import { GooseApp } from './api';
import * as mesh from './mesh';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { BLOCKED_PROTOCOLS, WEB_PROTOCOLS } from './utils/urlSecurity';
import { buildCSP } from './utils/csp';
import { applyInstanceAppId, instanceLabel, instanceWindowTitle } from './instanceIdentity';

applyInstanceAppId();

function shouldSetupUpdater(): boolean {
  // Setup updater if either the flag is enabled OR dev updates are enabled
  return UPDATES_ENABLED || process.env.ENABLE_DEV_UPDATES === 'true';
}

// ======================== ABRIDGED FOR TOOL CALL ========================
// see below