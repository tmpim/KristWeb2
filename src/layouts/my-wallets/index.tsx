import React, { Component, ReactNode } from "react";

import { ListView } from "@components/list-view";

import Col from "react-bootstrap/Col";

import { IconButton } from "@components/icon-button";
import Button from "react-bootstrap/Button";

import { SearchTextbox } from "@components/list-view/SearchTextbox";
import { FilterSelect } from "@components/list-view/FilterSelect";

export class MyWalletsPage extends Component {
  render(): ReactNode {
    return <ListView
      title="23 wallets"
      actions={<div>
        {/* TODO: mr-2 with CSS */}
        <IconButton size="sm" variant="secondary" icon="database" className="mr-2">
          Manage backups
        </IconButton>
        <IconButton size="sm" variant="success" icon="plus" className="mr-2">
          Create wallet
        </IconButton>
        <Button size="sm" variant="outline-primary">
          {/* TODO: find an icon for this */}
          Add existing wallet
        </Button>
      </div>}
      filters={<>
        {/* Search filter textbox */}
        <Col><SearchTextbox placeholder="Search wallets..." /></Col>
        
        {/* Category selection box */}
        <Col>
          <FilterSelect 
            options={new Map()
              .set("_all", "All categories")
              .set("shops", "Shops")
            }
          />
        </Col>
      </>}
    />;
  }
}
