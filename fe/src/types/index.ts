import ky, { type Options as KyOptions } from 'ky';
import React from 'react';
import ReactDOM from 'react-dom/client';

/**********************************************************************************/

export type RequiredFields<T, K extends keyof T> = Required<Pick<T, K>> & T;

/**********************************************************************************/

export { React, ReactDOM, ky, type KyOptions };
