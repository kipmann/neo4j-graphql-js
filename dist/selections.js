'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _toArray2 = require('babel-runtime/helpers/toArray');

var _toArray3 = _interopRequireDefault(_toArray2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

exports.buildCypherSelection = buildCypherSelection;

var _utils = require('./utils');

var _translate = require('./translate');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function buildCypherSelection(_ref) {
  var initial = _ref.initial,
    cypherParams = _ref.cypherParams,
    selections = _ref.selections,
    variableName = _ref.variableName,
    schemaType = _ref.schemaType,
    resolveInfo = _ref.resolveInfo,
    _ref$paramIndex = _ref.paramIndex,
    paramIndex = _ref$paramIndex === undefined ? 1 : _ref$paramIndex,
    _ref$parentSelectionI = _ref.parentSelectionInfo,
    parentSelectionInfo =
      _ref$parentSelectionI === undefined ? {} : _ref$parentSelectionI,
    _ref$secondParentSele = _ref.secondParentSelectionInfo,
    secondParentSelectionInfo =
      _ref$secondParentSele === undefined ? {} : _ref$secondParentSele;

  if (!selections.length) {
    return [initial, {}];
  }
  selections = (0, _utils.removeIgnoredFields)(schemaType, selections);
  var selectionFilters = (0, _utils.filtersFromSelections)(
    selections,
    resolveInfo.variableValues
  );
  var filterParams = (0, _utils.getFilterParams)(selectionFilters, paramIndex);
  var shallowFilterParams = (0, _entries2.default)(filterParams).reduce(
    function(result, _ref2) {
      var _ref3 = (0, _slicedToArray3.default)(_ref2, 2),
        key = _ref3[0],
        value = _ref3[1];

      result[value.index + '_' + key] = value.value;
      return result;
    },
    {}
  );

  var _selections = selections,
    _selections2 = (0, _toArray3.default)(_selections),
    headSelection = _selections2[0],
    tailSelections = _selections2.slice(1);

  var tailParams = {
    selections: tailSelections,
    cypherParams: cypherParams,
    variableName: variableName,
    schemaType: schemaType,
    resolveInfo: resolveInfo,
    parentSelectionInfo: parentSelectionInfo,
    secondParentSelectionInfo: secondParentSelectionInfo
  };

  var recurse = function recurse(args) {
    paramIndex =
      (0, _keys2.default)(shallowFilterParams).length > 0
        ? paramIndex + 1
        : paramIndex;

    var _buildCypherSelection = buildCypherSelection(
        (0, _extends3.default)({}, args, { paramIndex: paramIndex })
      ),
      _buildCypherSelection2 = (0, _slicedToArray3.default)(
        _buildCypherSelection,
        2
      ),
      subSelection = _buildCypherSelection2[0],
      subFilterParams = _buildCypherSelection2[1];

    return [
      subSelection,
      (0, _extends3.default)({}, shallowFilterParams, subFilterParams)
    ];
  };

  var fieldName = void 0;
  var isInlineFragment = false;
  var interfaceLabel = void 0;
  if (headSelection) {
    if (headSelection.kind === 'InlineFragment') {
      // get selections for the fragment and recurse on those
      var fragmentSelections = headSelection.selectionSet.selections;
      var fragmentTailParams = {
        selections: fragmentSelections,
        variableName: variableName,
        schemaType: schemaType,
        resolveInfo: resolveInfo,
        parentSelectionInfo: parentSelectionInfo,
        secondParentSelectionInfo: secondParentSelectionInfo
      };
      return recurse(
        (0, _extends3.default)(
          {
            initial: fragmentSelections.length
              ? initial
              : initial.substring(0, initial.lastIndexOf(','))
          },
          fragmentTailParams
        )
      );
    } else {
      fieldName = headSelection.name.value;
    }
  }

  var commaIfTail = tailSelections.length > 0 ? ',' : '';
  var isScalarSchemaType = (0, _utils.isGraphqlScalarType)(schemaType);
  var schemaTypeField = !isScalarSchemaType
    ? schemaType.getFields()[fieldName]
    : {};
  // Schema meta fields(__schema, __typename, etc)
  if (!isScalarSchemaType && !schemaTypeField) {
    return recurse(
      (0, _extends3.default)(
        {
          initial: tailSelections.length
            ? initial
            : initial.substring(0, initial.lastIndexOf(','))
        },
        tailParams
      )
    );
  }

  var fieldType =
    schemaTypeField && schemaTypeField.type ? schemaTypeField.type : {};
  var innerSchemaType = (0, _utils.innerType)(fieldType); // for target "type" aka label

  if (
    innerSchemaType &&
    innerSchemaType.astNode &&
    innerSchemaType.astNode.kind === 'InterfaceTypeDefinition'
  ) {
    isInlineFragment = true;
    // FIXME: remove unused variables
    var interfaceType = _schemaType;
    var interfaceName = innerSchemaType.name;

    var fragments = headSelection.selectionSet.selections.filter(function(
      item
    ) {
      return item.kind === 'InlineFragment';
    });

    // FIXME: this will only handle the first inline fragment
    var fragment = fragments[0];

    interfaceLabel = fragment
      ? fragment.typeCondition.name.value
      : interfaceName;
    var implementationName = fragment
      ? fragment.typeCondition.name.value
      : interfaceName;

    var _schemaType = resolveInfo.schema._implementations[interfaceName].find(
      function(intfc) {
        return intfc.name === implementationName;
      }
    );
  }

  var _cypherDirective = (0, _utils.cypherDirective)(schemaType, fieldName),
    customCypher = _cypherDirective.statement;

  var typeMap = resolveInfo.schema.getTypeMap();
  var schemaTypeAstNode = typeMap[schemaType].astNode;

  // Database meta fields(_id)
  if (fieldName === '_id') {
    return recurse(
      (0, _extends3.default)(
        {
          initial:
            '' +
            initial +
            fieldName +
            ': ID(' +
            (0, _utils.safeVar)(variableName) +
            ')' +
            commaIfTail
        },
        tailParams
      )
    );
  }
  // Main control flow
  if ((0, _utils.isGraphqlScalarType)(innerSchemaType)) {
    if (customCypher) {
      if ((0, _utils.getRelationTypeDirectiveArgs)(schemaTypeAstNode)) {
        variableName = variableName + '_relation';
      }
      return recurse(
        (0, _extends3.default)(
          {
            initial:
              '' +
              initial +
              fieldName +
              ': apoc.cypher.runFirstColumn("' +
              customCypher +
              '", {' +
              (0, _utils.cypherDirectiveArgs)(
                variableName,
                headSelection,
                cypherParams,
                schemaType,
                resolveInfo,
                paramIndex
              ) +
              '}, false)' +
              commaIfTail
          },
          tailParams
        )
      );
    } else if ((0, _utils.isTemporalField)(schemaType, fieldName)) {
      return recurse(
        (0, _translate.temporalField)({
          initial: initial,
          fieldName: fieldName,
          variableName: variableName,
          commaIfTail: commaIfTail,
          tailParams: tailParams,
          parentSelectionInfo: parentSelectionInfo,
          secondParentSelectionInfo: secondParentSelectionInfo
        })
      );
    }
    // graphql scalar type, no custom cypher statement
    return recurse(
      (0, _extends3.default)(
        {
          initial: initial + ' .' + fieldName + ' ' + commaIfTail
        },
        tailParams
      )
    );
  }
  // We have a graphql object type
  var innerSchemaTypeAstNode =
    innerSchemaType && typeMap[innerSchemaType]
      ? typeMap[innerSchemaType].astNode
      : {};
  var innerSchemaTypeRelation = (0, _utils.getRelationTypeDirectiveArgs)(
    innerSchemaTypeAstNode
  );
  var schemaTypeRelation = (0, _utils.getRelationTypeDirectiveArgs)(
    schemaTypeAstNode
  );

  var _relationDirective = (0, _utils.relationDirective)(schemaType, fieldName),
    relType = _relationDirective.name,
    relDirection = _relationDirective.direction;

  var nestedVariable = (0, _utils.decideNestedVariableName)({
    schemaTypeRelation: schemaTypeRelation,
    innerSchemaTypeRelation: innerSchemaTypeRelation,
    variableName: variableName,
    fieldName: fieldName,
    parentSelectionInfo: parentSelectionInfo
  });

  var skipLimit = (0, _utils.computeSkipLimit)(
    headSelection,
    resolveInfo.variableValues
  );

  var subSelections = (0, _utils.extractSelections)(
    headSelection.selectionSet ? headSelection.selectionSet.selections : [],
    resolveInfo.fragments
  );

  var subSelection = recurse({
    initial: '',
    selections: subSelections,
    variableName: nestedVariable,
    schemaType: innerSchemaType,
    resolveInfo: resolveInfo,
    cypherParams: cypherParams,
    parentSelectionInfo: {
      fieldName: fieldName,
      schemaType: schemaType,
      variableName: variableName,
      fieldType: fieldType,
      filterParams: filterParams,
      selections: selections,
      paramIndex: paramIndex
    },
    secondParentSelectionInfo: parentSelectionInfo
  });

  var selection = void 0;
  var fieldArgs =
    !isScalarSchemaType && schemaTypeField && schemaTypeField.args
      ? schemaTypeField.args.map(function(e) {
          return e.astNode;
        })
      : [];
  var temporalArgs = (0, _utils.getTemporalArguments)(fieldArgs);
  var queryParams = (0, _utils.paramsToString)(
    (0, _utils.innerFilterParams)(filterParams, temporalArgs)
  );
  var fieldInfo = {
    initial: initial,
    fieldName: fieldName,
    fieldType: fieldType,
    variableName: variableName,
    nestedVariable: nestedVariable,
    queryParams: queryParams,
    filterParams: filterParams,
    temporalArgs: temporalArgs,
    subSelection: subSelection,
    skipLimit: skipLimit,
    commaIfTail: commaIfTail,
    tailParams: tailParams
  };
  if (customCypher) {
    // Object type field with cypher directive
    selection = recurse(
      (0, _translate.customCypherField)(
        (0, _extends3.default)({}, fieldInfo, {
          cypherParams: cypherParams,
          paramIndex: paramIndex,
          schemaType: schemaType,
          schemaTypeRelation: schemaTypeRelation,
          customCypher: customCypher,
          headSelection: headSelection,
          resolveInfo: resolveInfo
        })
      )
    );
  } else if ((0, _utils.isTemporalType)(innerSchemaType.name)) {
    selection = recurse(
      (0, _translate.temporalType)(
        (0, _extends3.default)(
          {
            schemaType: schemaType,
            schemaTypeRelation: schemaTypeRelation,
            parentSelectionInfo: parentSelectionInfo
          },
          fieldInfo
        )
      )
    );
  } else if (relType && relDirection) {
    // Object type field with relation directive
    var temporalClauses = (0, _utils.temporalPredicateClauses)(
      filterParams,
      nestedVariable,
      temporalArgs
    );
    selection = recurse(
      (0, _translate.relationFieldOnNodeType)(
        (0, _extends3.default)({}, fieldInfo, {
          schemaType: schemaType,
          selections: selections,
          selectionFilters: selectionFilters,
          relDirection: relDirection,
          relType: relType,
          isInlineFragment: isInlineFragment,
          interfaceLabel: interfaceLabel,
          innerSchemaType: innerSchemaType,
          temporalClauses: temporalClauses,
          resolveInfo: resolveInfo,
          paramIndex: paramIndex,
          fieldArgs: fieldArgs
        })
      )
    );
    // post-processing of extracted argument parameter data for
    // null filters used for existence predicates
    var parentParamIndex = parentSelectionInfo.paramIndex;
    var filterParamKey = parentParamIndex + '_filter';
    // gets filter argument from subSelection because they
    // overwrite those in selection[1] in the below root return
    var fieldArgumentParams = subSelection[1];
    var filterParam = fieldArgumentParams[filterParamKey];
    if (filterParam) {
      subSelection[1][filterParamKey] = (0,
      _translate.transformExistentialFilterParams)(filterParam);
    }
  } else if (schemaTypeRelation) {
    // Object type field on relation type
    // (from, to, renamed, relation mutation payloads...)
    selection = recurse(
      (0, _translate.nodeTypeFieldOnRelationType)({
        fieldInfo: fieldInfo,
        schemaTypeRelation: schemaTypeRelation,
        innerSchemaType: innerSchemaType,
        isInlineFragment: isInlineFragment,
        interfaceLabel: interfaceLabel,
        paramIndex: paramIndex,
        schemaType: schemaType,
        filterParams: filterParams,
        temporalArgs: temporalArgs,
        parentSelectionInfo: parentSelectionInfo
      })
    );
  } else if (innerSchemaTypeRelation) {
    // Relation type field on node type (field payload types...)
    selection = recurse(
      (0, _translate.relationTypeFieldOnNodeType)(
        (0, _extends3.default)({}, fieldInfo, {
          innerSchemaTypeRelation: innerSchemaTypeRelation,
          schemaType: schemaType,
          filterParams: filterParams,
          temporalArgs: temporalArgs
        })
      )
    );
  }
  return [
    selection[0],
    (0, _extends3.default)({}, selection[1], subSelection[1])
  ];
}
