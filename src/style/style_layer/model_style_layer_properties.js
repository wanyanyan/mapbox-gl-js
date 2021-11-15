// This file is generated. Edit build/generate-style-code.js, then run `yarn run codegen`.
// @flow
/* eslint-disable */

import styleSpec from '../../style-spec/reference/latest.js';

import {
    Properties,
    DataConstantProperty
} from '../properties.js';


export type PaintProps = {|
    "model-opacity": DataConstantProperty<number>
|};

const paint: Properties<PaintProps> = new Properties({
    "model-opacity": new DataConstantProperty(styleSpec["paint_model"]["model-opacity"])
});

// Note: without adding the explicit type annotation, Flow infers weaker types
// for these objects from their use in the constructor to StyleLayer, as
// {layout?: Properties<...>, paint: Properties<...>}
export default ({ paint }: $Exact<{
  paint: Properties<PaintProps>
}>);
