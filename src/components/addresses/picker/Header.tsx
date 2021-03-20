// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt

import { OptionChildren } from "./options";

export function getCategoryHeader(category: string): Omit<OptionChildren, "options"> {
  return {
    label: (
      <div className="address-picker-category-header">
        {category}
      </div>
    ),

    // Will possibly be used for filtering. See OptionValue for a comment on
    // the naming of this prop.
    "data-picker-category": category
  };
}
