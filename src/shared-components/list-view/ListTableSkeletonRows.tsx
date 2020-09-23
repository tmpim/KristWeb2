import React, { Component, ReactNode } from "react";

import { Columns } from "./DataProvider";
import { SkeletonText } from "@components/skeleton/SkeletonText";

// Default widths for the skeleton elements that look good enough
const SKELETON_EM_WIDTHS = [10, 7, 5, 4, 8, 10];
const SKELETON_ROWS = 5;

interface Props<T> {  
  columns?: Columns<T>;
}

export class ListTableSkeletonRows<T> extends Component<Props<T>> {
  generateSkeletonSizes(): Array<number | undefined> | undefined {
    const { columns } = this.props;

    // Generate the sizes of skeleton text
    const skeletonSizes = columns
      ? Array.from(columns, ([, columnSpec]) => 
        columnSpec.skeletonEmWidth || undefined) // If no width was defined, use undefined
      : undefined;

    // Fill any missing sizes with defaults
    if (skeletonSizes !== undefined) {
      for (let i = 0; i < Math.min(skeletonSizes.length, SKELETON_EM_WIDTHS.length); i++) {
        if (skeletonSizes[i] !== undefined) continue;
        skeletonSizes[i] = SKELETON_EM_WIDTHS[i];
      }
    }

    return skeletonSizes;
  }

  generateSkeletonRow(skeletonSizes: Array<number | undefined>): Array<ReactNode> {
    return skeletonSizes.map((width, i) =>
      <td key={i}><SkeletonText emWidth={width} /></td>);
  }

  generateSkeletonRows(skeletonSizes: Array<number | undefined>): Array<ReactNode> {
    return new Array(SKELETON_ROWS).fill(null).map((_, i) => 
      <tr key={i}>{this.generateSkeletonRow(skeletonSizes)}</tr>);
  }

  render(): ReactNode {
    const skeletonSizes = this.generateSkeletonSizes();
    return skeletonSizes ? this.generateSkeletonRows(skeletonSizes) : null;
  }
}
