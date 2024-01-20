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
import { AiOutlinePlus } from 'react-icons/ai';
import { CiTrash } from 'react-icons/ci';
import { MdEdit } from 'react-icons/md';

/**********************************************************************************/

export type Optional<T, K extends keyof T> = Omit<T, K> & Pick<Partial<T>, K>;
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
export type ServiceCreation = Omit<Service, 'id'>;
export type ServiceUpdates = Partial<Omit<Service, 'id'>> & Pick<Service, 'id'>;

export type ClickEvent = React.MouseEvent<HTMLElement>;

/**********************************************************************************/

export {
  AiOutlinePlus,
  CiTrash,
  MdEdit,
  React,
  ReactDOM,
  ky,
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type KyOptions,
  type SetStateAction
};
