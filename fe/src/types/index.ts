import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Container,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import ky, { type Options as KyOptions } from 'ky';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction
} from 'react';
import ReactDOM from 'react-dom/client';
import { v4 as randomUUID } from 'uuid';

import type { Service, ServiceCreationObj as UpsertService } from './api.ts';

/**********************************************************************************/

export type Mode = 'development' | 'production' | 'test';

export type Optional<T, K extends keyof T> = Omit<T, K> & Pick<Partial<T>, K>;
export type RequiredFields<T, K extends keyof T> = Required<Pick<T, K>> & T;

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

/**********************************************************************************/

export {
  AddIcon,
  Box,
  Button,
  Card,
  Container,
  DeleteIcon,
  EditIcon,
  Grid,
  IconButton,
  React,
  ReactDOM,
  Stack,
  Typography,
  ky,
  randomUUID,
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type KyOptions,
  type Service,
  type SetStateAction,
  type UpsertService
};
