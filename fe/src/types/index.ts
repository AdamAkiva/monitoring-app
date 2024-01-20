import ky, { type Options as KyOptions } from 'ky';
import React, {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction
} from 'react';
import ReactDOM from 'react-dom/client';
import { AiOutlinePlus } from 'react-icons/ai';
import { CiTrash } from 'react-icons/ci';
import { MdEdit } from 'react-icons/md';

/**********************************************************************************/

export type RequiredFields<T, K extends keyof T> = Required<Pick<T, K>> & T;

export type Service = {
  id: string;
  name: string;
  uri: string;
  monitorInterval: number;
  thresholds: {
    lowerLimit: number;
    upperLimit: number;
  }[];
};

/**********************************************************************************/

export {
  AiOutlinePlus,
  CiTrash,
  MdEdit,
  React,
  ReactDOM,
  ky,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type KyOptions,
  type SetStateAction
};
