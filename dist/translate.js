'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.transformExistentialFilterParams = exports.translateMutation = exports.translateQuery = exports.temporalType = exports.temporalField = exports.nodeTypeFieldOnRelationType = exports.relationTypeFieldOnNodeType = exports.relationFieldOnNodeType = exports.customCypherField = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _utils = require('./utils');

var _graphql = require('graphql');

var _selections = require('./selections');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var customCypherField = (exports.customCypherField = function customCypherField(
  _ref
) {
  var customCypher = _ref.customCypher,
    cypherParams = _ref.cypherParams,
    paramIndex = _ref.paramIndex,
    schemaTypeRelation = _ref.schemaTypeRelation,
    initial = _ref.initial,
    fieldName = _ref.fieldName,
    fieldType = _ref.fieldType,
    nestedVariable = _ref.nestedVariable,
    variableName = _ref.variableName,
    headSelection = _ref.headSelection,
    schemaType = _ref.schemaType,
    resolveInfo = _ref.resolveInfo,
    subSelection = _ref.subSelection,
    skipLimit = _ref.skipLimit,
    commaIfTail = _ref.commaIfTail,
    tailParams = _ref.tailParams;

  if (schemaTypeRelation) {
    variableName = variableName + '_relation';
  }
  var fieldIsList = !!fieldType.ofType;
  // similar: [ x IN apoc.cypher.runFirstColumn("WITH {this} AS this MATCH (this)--(:Genre)--(o:Movie) RETURN o", {this: movie}, true) |x {.title}][1..2])

  // For @cypher fields with object payload types, customCypherField is
  // called after the recursive call to compute a subSelection. But recurse()
  // increments paramIndex. So here we need to decrement it in order to map
  // appropriately to the indexed keys produced in getFilterParams()
  var cypherFieldParamsIndex = paramIndex - 1;
  return (0, _extends3.default)(
    {
      initial:
        '' +
        initial +
        fieldName +
        ': ' +
        (fieldIsList ? '' : 'head(') +
        '[ ' +
        nestedVariable +
        ' IN apoc.cypher.runFirstColumn("' +
        customCypher +
        '", {' +
        (0, _utils.cypherDirectiveArgs)(
          variableName,
          headSelection,
          cypherParams,
          schemaType,
          resolveInfo,
          cypherFieldParamsIndex
        ) +
        '}, true) | ' +
        nestedVariable +
        ' {' +
        subSelection[0] +
        '}]' +
        (fieldIsList ? '' : ')') +
        skipLimit +
        ' ' +
        commaIfTail
    },
    tailParams
  );
});

var relationFieldOnNodeType = (exports.relationFieldOnNodeType = function relationFieldOnNodeType(
  _ref2
) {
  var initial = _ref2.initial,
    fieldName = _ref2.fieldName,
    fieldType = _ref2.fieldType,
    variableName = _ref2.variableName,
    relDirection = _ref2.relDirection,
    relType = _ref2.relType,
    nestedVariable = _ref2.nestedVariable,
    isInlineFragment = _ref2.isInlineFragment,
    interfaceLabel = _ref2.interfaceLabel,
    innerSchemaType = _ref2.innerSchemaType,
    paramIndex = _ref2.paramIndex,
    fieldArgs = _ref2.fieldArgs,
    filterParams = _ref2.filterParams,
    selectionFilters = _ref2.selectionFilters,
    temporalArgs = _ref2.temporalArgs,
    selections = _ref2.selections,
    schemaType = _ref2.schemaType,
    subSelection = _ref2.subSelection,
    skipLimit = _ref2.skipLimit,
    commaIfTail = _ref2.commaIfTail,
    tailParams = _ref2.tailParams,
    temporalClauses = _ref2.temporalClauses,
    resolveInfo = _ref2.resolveInfo;

  var safeVariableName = (0, _utils.safeVar)(nestedVariable);
  var allParams = (0, _utils.innerFilterParams)(filterParams, temporalArgs);
  var queryParams = (0, _utils.paramsToString)(
    _lodash2.default.filter(allParams, function(param) {
      return !Array.isArray(param.value);
    })
  );
  // build predicates for filter argument if provided
  var filterPredicates = buildFilterPredicates(
    fieldArgs,
    innerSchemaType,
    nestedVariable,
    resolveInfo,
    selectionFilters,
    paramIndex
  );
  var arrayFilterParams = _lodash2.default.pickBy(filterParams, function(
    param,
    keyName
  ) {
    return Array.isArray(param.value) && !('orderBy' === keyName);
  });
  var arrayPredicates = _lodash2.default.map(arrayFilterParams, function(
    value,
    key
  ) {
    var param = _lodash2.default.find(allParams, function(param) {
      return param.key === key;
    });
    return (
      safeVariableName +
      '.' +
      (0, _utils.safeVar)(key) +
      ' IN $' +
      param.value.index +
      '_' +
      key
    );
  });
  var whereClauses = [].concat(
    (0, _toConsumableArray3.default)(temporalClauses),
    (0, _toConsumableArray3.default)(arrayPredicates),
    (0, _toConsumableArray3.default)(filterPredicates)
  );
  var orderByParam = filterParams['orderBy'];
  var temporalOrdering = temporalOrderingFieldExists(schemaType, filterParams);
  return (0, _extends3.default)(
    {
      initial:
        '' +
        initial +
        fieldName +
        ': ' +
        (!(0, _utils.isArrayType)(fieldType) ? 'head(' : '') +
        (orderByParam
          ? temporalOrdering
            ? '[sortedElement IN apoc.coll.sortMulti('
            : 'apoc.coll.sortMulti('
          : '') +
        '[(' +
        (0, _utils.safeVar)(variableName) +
        ')' +
        (relDirection === 'in' || relDirection === 'IN' ? '<' : '') +
        '-[:' +
        (0, _utils.safeLabel)(relType) +
        ']-' +
        (relDirection === 'out' || relDirection === 'OUT' ? '>' : '') +
        '(' +
        safeVariableName +
        ':' +
        (0, _utils.safeLabel)(
          isInlineFragment ? interfaceLabel : innerSchemaType.name
        ) +
        queryParams +
        ')' +
        (whereClauses.length > 0
          ? ' WHERE ' + whereClauses.join(' AND ')
          : '') +
        ' | ' +
        nestedVariable +
        ' {' +
        (isInlineFragment
          ? 'FRAGMENT_TYPE: "' + interfaceLabel + '",' + subSelection[0]
          : subSelection[0]) +
        '}]' +
        (orderByParam
          ? ', [' +
            buildSortMultiArgs(orderByParam) +
            '])' +
            (temporalOrdering
              ? ' | sortedElement { .*,  ' +
                temporalTypeSelections(selections, innerSchemaType) +
                '}]'
              : '')
          : '') +
        (!(0, _utils.isArrayType)(fieldType) ? ')' : '') +
        skipLimit +
        ' ' +
        commaIfTail
    },
    tailParams
  );
});

var relationTypeFieldOnNodeType = (exports.relationTypeFieldOnNodeType = function relationTypeFieldOnNodeType(
  _ref3
) {
  var innerSchemaTypeRelation = _ref3.innerSchemaTypeRelation,
    initial = _ref3.initial,
    fieldName = _ref3.fieldName,
    subSelection = _ref3.subSelection,
    skipLimit = _ref3.skipLimit,
    commaIfTail = _ref3.commaIfTail,
    tailParams = _ref3.tailParams,
    fieldType = _ref3.fieldType,
    variableName = _ref3.variableName,
    schemaType = _ref3.schemaType,
    nestedVariable = _ref3.nestedVariable,
    queryParams = _ref3.queryParams,
    filterParams = _ref3.filterParams,
    temporalArgs = _ref3.temporalArgs;

  if (innerSchemaTypeRelation.from === innerSchemaTypeRelation.to) {
    return (0, _extends3.default)(
      {
        initial:
          '' +
          initial +
          fieldName +
          ': {' +
          subSelection[0] +
          '}' +
          skipLimit +
          ' ' +
          commaIfTail
      },
      tailParams
    );
  }
  var relationshipVariableName = nestedVariable + '_relation';
  var temporalClauses = (0, _utils.temporalPredicateClauses)(
    filterParams,
    relationshipVariableName,
    temporalArgs
  );
  return (0, _extends3.default)(
    {
      initial:
        '' +
        initial +
        fieldName +
        ': ' +
        (!(0, _utils.isArrayType)(fieldType) ? 'head(' : '') +
        '[(' +
        (0, _utils.safeVar)(variableName) +
        ')' +
        (schemaType.name === innerSchemaTypeRelation.to ? '<' : '') +
        '-[' +
        (0, _utils.safeVar)(relationshipVariableName) +
        ':' +
        (0, _utils.safeLabel)(innerSchemaTypeRelation.name) +
        queryParams +
        ']-' +
        (schemaType.name === innerSchemaTypeRelation.from ? '>' : '') +
        '(:' +
        (0, _utils.safeLabel)(
          schemaType.name === innerSchemaTypeRelation.from
            ? innerSchemaTypeRelation.to
            : innerSchemaTypeRelation.from
        ) +
        ') ' +
        (temporalClauses.length > 0
          ? 'WHERE ' + temporalClauses.join(' AND ') + ' '
          : '') +
        '| ' +
        relationshipVariableName +
        ' {' +
        subSelection[0] +
        '}]' +
        (!(0, _utils.isArrayType)(fieldType) ? ')' : '') +
        skipLimit +
        ' ' +
        commaIfTail
    },
    tailParams
  );
});

var nodeTypeFieldOnRelationType = (exports.nodeTypeFieldOnRelationType = function nodeTypeFieldOnRelationType(
  _ref4
) {
  var fieldInfo = _ref4.fieldInfo,
    schemaTypeRelation = _ref4.schemaTypeRelation,
    innerSchemaType = _ref4.innerSchemaType,
    isInlineFragment = _ref4.isInlineFragment,
    interfaceLabel = _ref4.interfaceLabel,
    paramIndex = _ref4.paramIndex,
    schemaType = _ref4.schemaType,
    filterParams = _ref4.filterParams,
    temporalArgs = _ref4.temporalArgs,
    parentSelectionInfo = _ref4.parentSelectionInfo;

  if (
    (0, _utils.isRootSelection)({
      selectionInfo: parentSelectionInfo,
      rootType: 'relationship'
    }) &&
    (0, _utils.isRelationTypeDirectedField)(fieldInfo.fieldName)
  ) {
    return relationTypeMutationPayloadField(
      (0, _extends3.default)({}, fieldInfo, {
        parentSelectionInfo: parentSelectionInfo
      })
    );
  }
  // Normal case of schemaType with a relationship directive
  return directedNodeTypeFieldOnRelationType(
    (0, _extends3.default)({}, fieldInfo, {
      schemaTypeRelation: schemaTypeRelation,
      innerSchemaType: innerSchemaType,
      isInlineFragment: isInlineFragment,
      interfaceLabel: interfaceLabel,
      paramIndex: paramIndex,
      schemaType: schemaType,
      filterParams: filterParams,
      temporalArgs: temporalArgs
    })
  );
});

var relationTypeMutationPayloadField = function relationTypeMutationPayloadField(
  _ref5
) {
  var initial = _ref5.initial,
    fieldName = _ref5.fieldName,
    variableName = _ref5.variableName,
    subSelection = _ref5.subSelection,
    skipLimit = _ref5.skipLimit,
    commaIfTail = _ref5.commaIfTail,
    tailParams = _ref5.tailParams,
    parentSelectionInfo = _ref5.parentSelectionInfo;

  var safeVariableName = (0, _utils.safeVar)(variableName);
  return (0, _extends3.default)(
    {
      initial:
        '' +
        initial +
        fieldName +
        ': ' +
        safeVariableName +
        ' {' +
        subSelection[0] +
        '}' +
        skipLimit +
        ' ' +
        commaIfTail
    },
    tailParams,
    {
      variableName:
        fieldName === 'from' ? parentSelectionInfo.to : parentSelectionInfo.from
    }
  );
};

var directedNodeTypeFieldOnRelationType = function directedNodeTypeFieldOnRelationType(
  _ref6
) {
  var initial = _ref6.initial,
    fieldName = _ref6.fieldName,
    fieldType = _ref6.fieldType,
    variableName = _ref6.variableName,
    queryParams = _ref6.queryParams,
    nestedVariable = _ref6.nestedVariable,
    subSelection = _ref6.subSelection,
    skipLimit = _ref6.skipLimit,
    commaIfTail = _ref6.commaIfTail,
    tailParams = _ref6.tailParams,
    schemaTypeRelation = _ref6.schemaTypeRelation,
    innerSchemaType = _ref6.innerSchemaType,
    isInlineFragment = _ref6.isInlineFragment,
    interfaceLabel = _ref6.interfaceLabel,
    filterParams = _ref6.filterParams,
    temporalArgs = _ref6.temporalArgs;

  var relType = schemaTypeRelation.name;
  var fromTypeName = schemaTypeRelation.from;
  var toTypeName = schemaTypeRelation.to;
  var isFromField = fieldName === fromTypeName || fieldName === 'from';
  var isToField = fieldName === toTypeName || fieldName === 'to';
  // Since the translations are significantly different,
  // we first check whether the relationship is reflexive
  if (fromTypeName === toTypeName) {
    var relationshipVariableName =
      variableName + '_' + (isFromField ? 'from' : 'to') + '_relation';
    if ((0, _utils.isRelationTypeDirectedField)(fieldName)) {
      var temporalFieldRelationshipVariableName = nestedVariable + '_relation';
      var temporalClauses = (0, _utils.temporalPredicateClauses)(
        filterParams,
        temporalFieldRelationshipVariableName,
        temporalArgs
      );
      return (0, _extends3.default)(
        {
          initial:
            '' +
            initial +
            fieldName +
            ': ' +
            (!(0, _utils.isArrayType)(fieldType) ? 'head(' : '') +
            '[(' +
            (0, _utils.safeVar)(variableName) +
            ')' +
            (isFromField ? '<' : '') +
            '-[' +
            (0, _utils.safeVar)(relationshipVariableName) +
            ':' +
            (0, _utils.safeLabel)(relType) +
            queryParams +
            ']-' +
            (isToField ? '>' : '') +
            '(' +
            (0, _utils.safeVar)(nestedVariable) +
            ':' +
            (0, _utils.safeLabel)(
              isInlineFragment ? interfaceLabel : fromTypeName
            ) +
            ') ' +
            (temporalClauses.length > 0
              ? 'WHERE ' + temporalClauses.join(' AND ') + ' '
              : '') +
            '| ' +
            relationshipVariableName +
            ' {' +
            (isInlineFragment
              ? 'FRAGMENT_TYPE: "' + interfaceLabel + '",' + subSelection[0]
              : subSelection[0]) +
            '}]' +
            (!(0, _utils.isArrayType)(fieldType) ? ')' : '') +
            skipLimit +
            ' ' +
            commaIfTail
        },
        tailParams
      );
    } else {
      // Case of a renamed directed field
      // e.g., 'from: Movie' -> 'Movie: Movie'
      return (0, _extends3.default)(
        {
          initial:
            '' +
            initial +
            fieldName +
            ': ' +
            variableName +
            ' {' +
            subSelection[0] +
            '}' +
            skipLimit +
            ' ' +
            commaIfTail
        },
        tailParams
      );
    }
  } else {
    variableName = variableName + '_relation';
    return (0, _extends3.default)(
      {
        initial:
          '' +
          initial +
          fieldName +
          ': ' +
          (!(0, _utils.isArrayType)(fieldType) ? 'head(' : '') +
          '[(:' +
          (0, _utils.safeLabel)(isFromField ? toTypeName : fromTypeName) +
          ')' +
          (isFromField ? '<' : '') +
          '-[' +
          (0, _utils.safeVar)(variableName) +
          ']-' +
          (isToField ? '>' : '') +
          '(' +
          (0, _utils.safeVar)(nestedVariable) +
          ':' +
          (0, _utils.safeLabel)(
            isInlineFragment ? interfaceLabel : innerSchemaType.name
          ) +
          queryParams +
          ') | ' +
          nestedVariable +
          ' {' +
          (isInlineFragment
            ? 'FRAGMENT_TYPE: "' + interfaceLabel + '",' + subSelection[0]
            : subSelection[0]) +
          '}]' +
          (!(0, _utils.isArrayType)(fieldType) ? ')' : '') +
          skipLimit +
          ' ' +
          commaIfTail
      },
      tailParams
    );
  }
};

var temporalField = (exports.temporalField = function temporalField(_ref7) {
  var initial = _ref7.initial,
    fieldName = _ref7.fieldName,
    commaIfTail = _ref7.commaIfTail,
    tailParams = _ref7.tailParams,
    parentSelectionInfo = _ref7.parentSelectionInfo,
    secondParentSelectionInfo = _ref7.secondParentSelectionInfo;

  var parentFieldName = parentSelectionInfo.fieldName;
  var parentFieldType = parentSelectionInfo.fieldType;
  var parentSchemaType = parentSelectionInfo.schemaType;
  var parentVariableName = parentSelectionInfo.variableName;
  var secondParentVariableName = secondParentSelectionInfo.variableName;
  // Initially assume that the parent type of the temporal type
  // containing this temporal field was a node
  var variableName = parentVariableName;
  var fieldIsArray = (0, _utils.isArrayType)(parentFieldType);
  if (parentSchemaType && !(0, _utils.isNodeType)(parentSchemaType.astNode)) {
    // initial assumption wrong, build appropriate relationship variable
    if (
      (0, _utils.isRootSelection)({
        selectionInfo: secondParentSelectionInfo,
        rootType: 'relationship'
      })
    ) {
      // If the second parent selection scope above is the root
      // then we need to use the root variableName
      variableName = secondParentVariableName + '_relation';
    } else if ((0, _utils.isRelationTypePayload)(parentSchemaType)) {
      var parentSchemaTypeRelation = (0, _utils.getRelationTypeDirectiveArgs)(
        parentSchemaType.astNode
      );
      if (parentSchemaTypeRelation.from === parentSchemaTypeRelation.to) {
        variableName = variableName + '_relation';
      } else {
        variableName = variableName + '_relation';
      }
    }
  }
  return (0, _extends3.default)(
    {
      initial:
        initial +
        ' ' +
        fieldName +
        ': ' +
        (fieldIsArray
          ? (fieldName === 'formatted'
              ? 'toString(TEMPORAL_INSTANCE)'
              : 'TEMPORAL_INSTANCE.' + fieldName) +
            ' ' +
            commaIfTail
          : '' +
            (fieldName === 'formatted'
              ? 'toString(' +
                (0, _utils.safeVar)(variableName) +
                '.' +
                parentFieldName +
                ') ' +
                commaIfTail
              : (0, _utils.safeVar)(variableName) +
                '.' +
                parentFieldName +
                '.' +
                fieldName +
                ' ' +
                commaIfTail))
    },
    tailParams
  );
});

var temporalType = (exports.temporalType = function temporalType(_ref8) {
  var initial = _ref8.initial,
    fieldName = _ref8.fieldName,
    subSelection = _ref8.subSelection,
    commaIfTail = _ref8.commaIfTail,
    tailParams = _ref8.tailParams,
    variableName = _ref8.variableName,
    nestedVariable = _ref8.nestedVariable,
    fieldType = _ref8.fieldType,
    schemaType = _ref8.schemaType,
    schemaTypeRelation = _ref8.schemaTypeRelation,
    parentSelectionInfo = _ref8.parentSelectionInfo;

  var parentVariableName = parentSelectionInfo.variableName;
  var parentFilterParams = parentSelectionInfo.filterParams;
  var parentSchemaType = parentSelectionInfo.schemaType;
  var safeVariableName = (0, _utils.safeVar)(variableName);
  var fieldIsArray = (0, _utils.isArrayType)(fieldType);
  if (!(0, _utils.isNodeType)(schemaType.astNode)) {
    if (
      (0, _utils.isRelationTypePayload)(schemaType) &&
      schemaTypeRelation.from === schemaTypeRelation.to
    ) {
      variableName = nestedVariable + '_relation';
    } else {
      if (fieldIsArray) {
        if (
          (0, _utils.isRootSelection)({
            selectionInfo: parentSelectionInfo,
            rootType: 'relationship'
          })
        ) {
          if (schemaTypeRelation.from === schemaTypeRelation.to) {
            variableName = parentVariableName + '_relation';
          } else {
            variableName = parentVariableName + '_relation';
          }
        } else {
          variableName = variableName + '_relation';
        }
      } else {
        variableName = nestedVariable + '_relation';
      }
    }
  }
  return (0, _extends3.default)(
    {
      initial:
        '' +
        initial +
        fieldName +
        ': ' +
        (fieldIsArray
          ? 'reduce(a = [], TEMPORAL_INSTANCE IN ' +
            variableName +
            '.' +
            fieldName +
            ' | a + {' +
            subSelection[0] +
            '})' +
            commaIfTail
          : temporalOrderingFieldExists(parentSchemaType, parentFilterParams)
          ? safeVariableName + '.' + fieldName + commaIfTail
          : '{' + subSelection[0] + '}' + commaIfTail)
    },
    tailParams
  );
});

// Query API root operation branch
var translateQuery = (exports.translateQuery = function translateQuery(_ref9) {
  var resolveInfo = _ref9.resolveInfo,
    context = _ref9.context,
    selections = _ref9.selections,
    variableName = _ref9.variableName,
    typeName = _ref9.typeName,
    schemaType = _ref9.schemaType,
    first = _ref9.first,
    offset = _ref9.offset,
    _id = _ref9._id,
    orderBy = _ref9.orderBy,
    otherParams = _ref9.otherParams;

  var _filterNullParams = (0, _utils.filterNullParams)({
      offset: offset,
      first: first,
      otherParams: otherParams
    }),
    _filterNullParams2 = (0, _slicedToArray3.default)(_filterNullParams, 2),
    nullParams = _filterNullParams2[0],
    nonNullParams = _filterNullParams2[1];

  var filterParams = (0, _utils.getFilterParams)(nonNullParams);
  var queryArgs = (0, _utils.getQueryArguments)(resolveInfo);
  var temporalArgs = (0, _utils.getTemporalArguments)(queryArgs);
  var queryTypeCypherDirective = (0, _utils.getQueryCypherDirective)(
    resolveInfo
  );
  var cypherParams = getCypherParams(context);
  var queryParams = (0, _utils.paramsToString)(
    (0, _utils.innerFilterParams)(
      filterParams,
      temporalArgs,
      null,
      queryTypeCypherDirective ? true : false
    ),
    cypherParams
  );
  var safeVariableName = (0, _utils.safeVar)(variableName);
  var temporalClauses = (0, _utils.temporalPredicateClauses)(
    filterParams,
    safeVariableName,
    temporalArgs
  );
  var outerSkipLimit = (0, _utils.getOuterSkipLimit)(first, offset);
  var orderByValue = (0, _utils.computeOrderBy)(resolveInfo, selections);

  if (queryTypeCypherDirective) {
    return customQuery({
      resolveInfo: resolveInfo,
      cypherParams: cypherParams,
      schemaType: schemaType,
      argString: queryParams,
      selections: selections,
      variableName: variableName,
      typeName: typeName,
      orderByValue: orderByValue,
      outerSkipLimit: outerSkipLimit,
      queryTypeCypherDirective: queryTypeCypherDirective,
      nonNullParams: nonNullParams
    });
  } else {
    return nodeQuery({
      resolveInfo: resolveInfo,
      cypherParams: cypherParams,
      schemaType: schemaType,
      argString: queryParams,
      selections: selections,
      variableName: variableName,
      typeName: typeName,
      temporalClauses: temporalClauses,
      orderByValue: orderByValue,
      outerSkipLimit: outerSkipLimit,
      nullParams: nullParams,
      nonNullParams: nonNullParams,
      filterParams: filterParams,
      temporalArgs: temporalArgs,
      _id: _id
    });
  }
});

var getCypherParams = function getCypherParams(context) {
  return context &&
    context.cypherParams &&
    context.cypherParams instanceof Object &&
    (0, _keys2.default)(context.cypherParams).length > 0
    ? context.cypherParams
    : undefined;
};

// Custom read operation
var customQuery = function customQuery(_ref10) {
  var resolveInfo = _ref10.resolveInfo,
    cypherParams = _ref10.cypherParams,
    schemaType = _ref10.schemaType,
    argString = _ref10.argString,
    selections = _ref10.selections,
    variableName = _ref10.variableName,
    typeName = _ref10.typeName,
    orderByValue = _ref10.orderByValue,
    outerSkipLimit = _ref10.outerSkipLimit,
    queryTypeCypherDirective = _ref10.queryTypeCypherDirective,
    nonNullParams = _ref10.nonNullParams;

  var safeVariableName = (0, _utils.safeVar)(variableName);

  var _buildCypherSelection = (0, _selections.buildCypherSelection)({
      initial: '',
      cypherParams: cypherParams,
      selections: selections,
      variableName: variableName,
      schemaType: schemaType,
      resolveInfo: resolveInfo,
      paramIndex: 1
    }),
    _buildCypherSelection2 = (0, _slicedToArray3.default)(
      _buildCypherSelection,
      2
    ),
    subQuery = _buildCypherSelection2[0],
    subParams = _buildCypherSelection2[1];

  var params = (0, _extends3.default)({}, nonNullParams, subParams);
  if (cypherParams) {
    params['cypherParams'] = cypherParams;
  }
  // QueryType with a @cypher directive
  var cypherQueryArg = queryTypeCypherDirective.arguments.find(function(x) {
    return x.name.value === 'statement';
  });
  var isScalarType = (0, _utils.isGraphqlScalarType)(schemaType);
  var temporalType = (0, _utils.isTemporalType)(schemaType.name);
  var query =
    'WITH apoc.cypher.runFirstColumn("' +
    cypherQueryArg.value.value +
    '", ' +
    (argString || 'null') +
    ', True) AS x UNWIND x AS ' +
    safeVariableName +
    ' RETURN ' +
    safeVariableName +
    ' ' +
    // Don't add subQuery for scalar type payloads
    // FIXME: fix subselection translation for temporal type payload
    (!temporalType && !isScalarType
      ? '{' + subQuery + '} AS ' + safeVariableName + orderByValue
      : '') +
    outerSkipLimit;
  return [query, params];
};

// Generated API
var nodeQuery = function nodeQuery(_ref11) {
  var resolveInfo = _ref11.resolveInfo,
    cypherParams = _ref11.cypherParams,
    schemaType = _ref11.schemaType,
    selections = _ref11.selections,
    variableName = _ref11.variableName,
    typeName = _ref11.typeName,
    temporalClauses = _ref11.temporalClauses,
    orderByValue = _ref11.orderByValue,
    outerSkipLimit = _ref11.outerSkipLimit,
    nullParams = _ref11.nullParams,
    nonNullParams = _ref11.nonNullParams,
    filterParams = _ref11.filterParams,
    temporalArgs = _ref11.temporalArgs,
    _id = _ref11._id;

  var safeVariableName = (0, _utils.safeVar)(variableName);
  var safeLabelName = (0, _utils.safeLabel)(typeName);
  var rootParamIndex = 1;

  var _buildCypherSelection3 = (0, _selections.buildCypherSelection)({
      initial: '',
      cypherParams: cypherParams,
      selections: selections,
      variableName: variableName,
      schemaType: schemaType,
      resolveInfo: resolveInfo,
      paramIndex: rootParamIndex
    }),
    _buildCypherSelection4 = (0, _slicedToArray3.default)(
      _buildCypherSelection3,
      2
    ),
    subQuery = _buildCypherSelection4[0],
    subParams = _buildCypherSelection4[1];

  var params = (0, _extends3.default)({}, nonNullParams, subParams);
  if (cypherParams) {
    params['cypherParams'] = cypherParams;
  }

  // transform null filters in root filter argument
  var filterParam = params['filter'];
  if (filterParam)
    params['filter'] = transformExistentialFilterParams(filterParam);

  var arrayParams = _lodash2.default.pickBy(filterParams, Array.isArray);
  var args = (0, _utils.innerFilterParams)(filterParams, temporalArgs);

  var argString = (0, _utils.paramsToString)(
    _lodash2.default.filter(args, function(arg) {
      return !Array.isArray(arg.value);
    })
  );

  var idWherePredicate =
    typeof _id !== 'undefined' ? 'ID(' + safeVariableName + ')=' + _id : '';

  var nullFieldPredicates = (0, _keys2.default)(nullParams).map(function(key) {
    return variableName + '.' + key + ' IS NULL';
  });

  var arrayPredicates = _lodash2.default.map(arrayParams, function(value, key) {
    return safeVariableName + '.' + (0, _utils.safeVar)(key) + ' IN $' + key;
  });

  // build predicates for filter argument if provided
  var fieldArgs = (0, _utils.getQueryArguments)(resolveInfo);
  var filterPredicates = buildFilterPredicates(
    fieldArgs,
    schemaType,
    variableName,
    resolveInfo,
    nonNullParams,
    rootParamIndex
  );

  var predicateClauses = [idWherePredicate]
    .concat(
      (0, _toConsumableArray3.default)(filterPredicates),
      (0, _toConsumableArray3.default)(nullFieldPredicates),
      (0, _toConsumableArray3.default)(temporalClauses),
      (0, _toConsumableArray3.default)(arrayPredicates)
    )
    .filter(function(predicate) {
      return !!predicate;
    })
    .join(' AND ');

  var predicate = predicateClauses ? 'WHERE ' + predicateClauses + ' ' : '';

  var orderByClause = orderByValue
    ? 'WITH ' + safeVariableName + ' ' + orderByValue
    : '';
  var query =
    'MATCH (' +
    safeVariableName +
    ':' +
    safeLabelName +
    (argString ? ' ' + argString : '') +
    ') ' +
    predicate +
    (orderByClause +
      ' RETURN ' +
      safeVariableName +
      ' {' +
      subQuery +
      '} AS ' +
      safeVariableName +
      outerSkipLimit);

  return [query, params];
};

// Mutation API root operation branch
var translateMutation = (exports.translateMutation = function translateMutation(
  _ref12
) {
  var resolveInfo = _ref12.resolveInfo,
    context = _ref12.context,
    schemaType = _ref12.schemaType,
    selections = _ref12.selections,
    variableName = _ref12.variableName,
    typeName = _ref12.typeName,
    first = _ref12.first,
    offset = _ref12.offset,
    otherParams = _ref12.otherParams;

  var outerSkipLimit = (0, _utils.getOuterSkipLimit)(first, offset);
  var orderByValue = (0, _utils.computeOrderBy)(resolveInfo, selections);
  var mutationTypeCypherDirective = (0, _utils.getMutationCypherDirective)(
    resolveInfo
  );
  var params = (0, _utils.initializeMutationParams)({
    resolveInfo: resolveInfo,
    mutationTypeCypherDirective: mutationTypeCypherDirective,
    first: first,
    otherParams: otherParams,
    offset: offset
  });
  var mutationInfo = {
    params: params,
    selections: selections,
    schemaType: schemaType,
    resolveInfo: resolveInfo
  };
  if (mutationTypeCypherDirective) {
    return customMutation(
      (0, _extends3.default)({}, mutationInfo, {
        context: context,
        mutationTypeCypherDirective: mutationTypeCypherDirective,
        variableName: variableName,
        orderByValue: orderByValue,
        outerSkipLimit: outerSkipLimit
      })
    );
  } else if ((0, _utils.isCreateMutation)(resolveInfo)) {
    return nodeCreate(
      (0, _extends3.default)({}, mutationInfo, {
        variableName: variableName,
        typeName: typeName
      })
    );
  } else if ((0, _utils.isUpdateMutation)(resolveInfo)) {
    return nodeUpdate(
      (0, _extends3.default)({}, mutationInfo, {
        variableName: variableName,
        typeName: typeName
      })
    );
  } else if ((0, _utils.isDeleteMutation)(resolveInfo)) {
    return nodeDelete(
      (0, _extends3.default)({}, mutationInfo, {
        variableName: variableName,
        typeName: typeName
      })
    );
  } else if ((0, _utils.isAddMutation)(resolveInfo)) {
    return relationshipCreate((0, _extends3.default)({}, mutationInfo));
  } else if ((0, _utils.isRemoveMutation)(resolveInfo)) {
    return relationshipDelete(
      (0, _extends3.default)({}, mutationInfo, {
        variableName: variableName
      })
    );
  } else {
    // throw error - don't know how to handle this type of mutation
    throw new Error(
      'Do not know how to handle this type of mutation. Mutation does not follow naming convention.'
    );
  }
});

// Custom write operation
var customMutation = function customMutation(_ref13) {
  var params = _ref13.params,
    context = _ref13.context,
    mutationTypeCypherDirective = _ref13.mutationTypeCypherDirective,
    selections = _ref13.selections,
    variableName = _ref13.variableName,
    schemaType = _ref13.schemaType,
    resolveInfo = _ref13.resolveInfo,
    orderByValue = _ref13.orderByValue,
    outerSkipLimit = _ref13.outerSkipLimit;

  var cypherParams = getCypherParams(context);
  var safeVariableName = (0, _utils.safeVar)(variableName);
  // FIXME: support IN for multiple values -> WHERE
  var argString = (0, _utils.paramsToString)(
    (0, _utils.innerFilterParams)(
      (0, _utils.getFilterParams)(params.params || params),
      null,
      null,
      true
    ),
    cypherParams
  );
  var cypherQueryArg = mutationTypeCypherDirective.arguments.find(function(x) {
    return x.name.value === 'statement';
  });

  var _buildCypherSelection5 = (0, _selections.buildCypherSelection)({
      initial: '',
      selections: selections,
      variableName: variableName,
      schemaType: schemaType,
      resolveInfo: resolveInfo,
      paramIndex: 1
    }),
    _buildCypherSelection6 = (0, _slicedToArray3.default)(
      _buildCypherSelection5,
      2
    ),
    subQuery = _buildCypherSelection6[0],
    subParams = _buildCypherSelection6[1];

  var isScalarType = (0, _utils.isGraphqlScalarType)(schemaType);
  var temporalType = (0, _utils.isTemporalType)(schemaType.name);
  params = (0, _extends3.default)({}, params, subParams);
  if (cypherParams) {
    params['cypherParams'] = cypherParams;
  }
  var query =
    'CALL apoc.cypher.doIt("' +
    cypherQueryArg.value.value +
    '", ' +
    argString +
    ') YIELD value\n    WITH apoc.map.values(value, [keys(value)[0]])[0] AS ' +
    safeVariableName +
    '\n    RETURN ' +
    safeVariableName +
    ' ' +
    (!temporalType && !isScalarType
      ? '{' +
        subQuery +
        '} AS ' +
        safeVariableName +
        orderByValue +
        outerSkipLimit
      : '');
  return [query, params];
};

// Generated API
// Node Create - Update - Delete
var nodeCreate = function nodeCreate(_ref14) {
  var variableName = _ref14.variableName,
    typeName = _ref14.typeName,
    selections = _ref14.selections,
    schemaType = _ref14.schemaType,
    resolveInfo = _ref14.resolveInfo,
    params = _ref14.params;

  var safeVariableName = (0, _utils.safeVar)(variableName);
  var safeLabelName = (0, _utils.safeLabel)(typeName);
  var statements = [];
  var args = (0, _utils.getMutationArguments)(resolveInfo);
  statements = (0, _utils.possiblySetFirstId)({
    args: args,
    statements: statements,
    params: params.params
  });

  var _buildCypherParameter = (0, _utils.buildCypherParameters)({
      args: args,
      statements: statements,
      params: params,
      paramKey: 'params'
    }),
    _buildCypherParameter2 = (0, _slicedToArray3.default)(
      _buildCypherParameter,
      2
    ),
    preparedParams = _buildCypherParameter2[0],
    paramStatements = _buildCypherParameter2[1];

  var _buildCypherSelection7 = (0, _selections.buildCypherSelection)({
      initial: '',
      selections: selections,
      variableName: variableName,
      schemaType: schemaType,
      resolveInfo: resolveInfo,
      paramIndex: 1
    }),
    _buildCypherSelection8 = (0, _slicedToArray3.default)(
      _buildCypherSelection7,
      2
    ),
    subQuery = _buildCypherSelection8[0],
    subParams = _buildCypherSelection8[1];

  params = (0, _extends3.default)({}, preparedParams, subParams);
  var query =
    '\n    CREATE (' +
    safeVariableName +
    ':' +
    safeLabelName +
    ' {' +
    paramStatements.join(',') +
    '})\n    RETURN ' +
    safeVariableName +
    ' {' +
    subQuery +
    '} AS ' +
    safeVariableName +
    '\n  ';
  return [query, params];
};

var nodeUpdate = function nodeUpdate(_ref15) {
  var resolveInfo = _ref15.resolveInfo,
    variableName = _ref15.variableName,
    typeName = _ref15.typeName,
    selections = _ref15.selections,
    schemaType = _ref15.schemaType,
    params = _ref15.params;

  var safeVariableName = (0, _utils.safeVar)(variableName);
  var safeLabelName = (0, _utils.safeLabel)(typeName);
  var args = (0, _utils.getMutationArguments)(resolveInfo);
  var primaryKeyArg = args[0];
  var primaryKeyArgName = primaryKeyArg.name.value;
  var temporalArgs = (0, _utils.getTemporalArguments)(args);

  var _splitSelectionParame = (0, _utils.splitSelectionParameters)(
      params,
      primaryKeyArgName,
      'params'
    ),
    _splitSelectionParame2 = (0, _slicedToArray3.default)(
      _splitSelectionParame,
      2
    ),
    primaryKeyParam = _splitSelectionParame2[0],
    updateParams = _splitSelectionParame2[1];

  var temporalClauses = (0, _utils.temporalPredicateClauses)(
    primaryKeyParam,
    safeVariableName,
    temporalArgs,
    'params'
  );
  var predicateClauses = []
    .concat((0, _toConsumableArray3.default)(temporalClauses))
    .filter(function(predicate) {
      return !!predicate;
    })
    .join(' AND ');
  var predicate = predicateClauses ? 'WHERE ' + predicateClauses + ' ' : '';

  var _buildCypherParameter3 = (0, _utils.buildCypherParameters)({
      args: args,
      params: updateParams,
      paramKey: 'params'
    }),
    _buildCypherParameter4 = (0, _slicedToArray3.default)(
      _buildCypherParameter3,
      2
    ),
    preparedParams = _buildCypherParameter4[0],
    paramUpdateStatements = _buildCypherParameter4[1];

  var query =
    'MATCH (' +
    safeVariableName +
    ':' +
    safeLabelName +
    (predicate !== ''
      ? ') ' + predicate + ' '
      : '{' + primaryKeyArgName + ': $params.' + primaryKeyArgName + '})') +
    '\n  ';
  if (paramUpdateStatements.length > 0) {
    query +=
      'SET ' +
      safeVariableName +
      ' += {' +
      paramUpdateStatements.join(',') +
      '} ';
  }

  var _buildCypherSelection9 = (0, _selections.buildCypherSelection)({
      initial: '',
      selections: selections,
      variableName: variableName,
      schemaType: schemaType,
      resolveInfo: resolveInfo,
      paramIndex: 1
    }),
    _buildCypherSelection10 = (0, _slicedToArray3.default)(
      _buildCypherSelection9,
      2
    ),
    subQuery = _buildCypherSelection10[0],
    subParams = _buildCypherSelection10[1];

  preparedParams.params[primaryKeyArgName] = primaryKeyParam[primaryKeyArgName];
  params = (0, _extends3.default)({}, preparedParams, subParams);
  query +=
    'RETURN ' + safeVariableName + ' {' + subQuery + '} AS ' + safeVariableName;
  return [query, params];
};

var nodeDelete = function nodeDelete(_ref16) {
  var resolveInfo = _ref16.resolveInfo,
    selections = _ref16.selections,
    variableName = _ref16.variableName,
    typeName = _ref16.typeName,
    schemaType = _ref16.schemaType,
    params = _ref16.params;

  var safeVariableName = (0, _utils.safeVar)(variableName);
  var safeLabelName = (0, _utils.safeLabel)(typeName);
  var args = (0, _utils.getMutationArguments)(resolveInfo);
  var primaryKeyArg = args[0];
  var primaryKeyArgName = primaryKeyArg.name.value;
  var temporalArgs = (0, _utils.getTemporalArguments)(args);

  var _splitSelectionParame3 = (0, _utils.splitSelectionParameters)(
      params,
      primaryKeyArgName
    ),
    _splitSelectionParame4 = (0, _slicedToArray3.default)(
      _splitSelectionParame3,
      1
    ),
    primaryKeyParam = _splitSelectionParame4[0];

  var temporalClauses = (0, _utils.temporalPredicateClauses)(
    primaryKeyParam,
    safeVariableName,
    temporalArgs
  );

  var _buildCypherParameter5 = (0, _utils.buildCypherParameters)({
      args: args,
      params: params
    }),
    _buildCypherParameter6 = (0, _slicedToArray3.default)(
      _buildCypherParameter5,
      1
    ),
    preparedParams = _buildCypherParameter6[0];

  var query =
    'MATCH (' +
    safeVariableName +
    ':' +
    safeLabelName +
    (temporalClauses.length > 0
      ? ') WHERE ' + temporalClauses.join(' AND ')
      : ' {' + primaryKeyArgName + ': $' + primaryKeyArgName + '})');

  var _buildCypherSelection11 = (0, _selections.buildCypherSelection)({
      initial: '',
      selections: selections,
      variableName: variableName,
      schemaType: schemaType,
      resolveInfo: resolveInfo,
      paramIndex: 1
    }),
    _buildCypherSelection12 = (0, _slicedToArray3.default)(
      _buildCypherSelection11,
      2
    ),
    subQuery = _buildCypherSelection12[0],
    subParams = _buildCypherSelection12[1];

  params = (0, _extends3.default)({}, preparedParams, subParams);
  var deletionVariableName = (0, _utils.safeVar)(variableName + '_toDelete');
  // Cannot execute a map projection on a deleted node in Neo4j
  // so the projection is executed and aliased before the delete
  query +=
    '\nWITH ' +
    safeVariableName +
    ' AS ' +
    deletionVariableName +
    ', ' +
    safeVariableName +
    ' {' +
    subQuery +
    '} AS ' +
    safeVariableName +
    '\nDETACH DELETE ' +
    deletionVariableName +
    '\nRETURN ' +
    safeVariableName;
  return [query, params];
};

// Relation Add / Remove
var relationshipCreate = function relationshipCreate(_ref17) {
  var resolveInfo = _ref17.resolveInfo,
    selections = _ref17.selections,
    schemaType = _ref17.schemaType,
    params = _ref17.params;

  var mutationMeta = void 0,
    relationshipNameArg = void 0,
    fromTypeArg = void 0,
    toTypeArg = void 0;
  try {
    mutationMeta = resolveInfo.schema
      .getMutationType()
      .getFields()
      [resolveInfo.fieldName].astNode.directives.find(function(x) {
        return x.name.value === 'MutationMeta';
      });
  } catch (e) {
    throw new Error(
      'Missing required MutationMeta directive on add relationship directive'
    );
  }

  try {
    relationshipNameArg = mutationMeta.arguments.find(function(x) {
      return x.name.value === 'relationship';
    });
    fromTypeArg = mutationMeta.arguments.find(function(x) {
      return x.name.value === 'from';
    });
    toTypeArg = mutationMeta.arguments.find(function(x) {
      return x.name.value === 'to';
    });
  } catch (e) {
    throw new Error(
      'Missing required argument in MutationMeta directive (relationship, from, or to)'
    );
  }

  //TODO: need to handle one-to-one and one-to-many
  var args = (0, _utils.getMutationArguments)(resolveInfo);
  var typeMap = resolveInfo.schema.getTypeMap();

  var fromType = fromTypeArg.value.value;
  var fromVar = (0, _utils.lowFirstLetter)(fromType) + '_from';
  var fromInputArg = args.find(function(e) {
    return e.name.value === 'from';
  }).type;
  var fromInputAst =
    typeMap[(0, _graphql.getNamedType)(fromInputArg).type.name.value].astNode;
  var fromFields = fromInputAst.fields;
  var fromParam = fromFields[0].name.value;
  var fromTemporalArgs = (0, _utils.getTemporalArguments)(fromFields);

  var toType = toTypeArg.value.value;
  var toVar = (0, _utils.lowFirstLetter)(toType) + '_to';
  var toInputArg = args.find(function(e) {
    return e.name.value === 'to';
  }).type;
  var toInputAst =
    typeMap[(0, _graphql.getNamedType)(toInputArg).type.name.value].astNode;
  var toFields = toInputAst.fields;
  var toParam = toFields[0].name.value;
  var toTemporalArgs = (0, _utils.getTemporalArguments)(toFields);

  var relationshipName = relationshipNameArg.value.value;
  var lowercased = relationshipName.toLowerCase();
  var dataInputArg = args.find(function(e) {
    return e.name.value === 'data';
  });
  var dataInputAst = dataInputArg
    ? typeMap[(0, _graphql.getNamedType)(dataInputArg.type).type.name.value]
        .astNode
    : undefined;
  var dataFields = dataInputAst ? dataInputAst.fields : [];

  var _buildCypherParameter7 = (0, _utils.buildCypherParameters)({
      args: dataFields,
      params: params,
      paramKey: 'data'
    }),
    _buildCypherParameter8 = (0, _slicedToArray3.default)(
      _buildCypherParameter7,
      2
    ),
    preparedParams = _buildCypherParameter8[0],
    paramStatements = _buildCypherParameter8[1];

  var schemaTypeName = (0, _utils.safeVar)(schemaType);
  var fromVariable = (0, _utils.safeVar)(fromVar);
  var fromLabel = (0, _utils.safeLabel)(fromType);
  var toVariable = (0, _utils.safeVar)(toVar);
  var toLabel = (0, _utils.safeLabel)(toType);
  var relationshipVariable = (0, _utils.safeVar)(lowercased + '_relation');
  var relationshipLabel = (0, _utils.safeLabel)(relationshipName);
  var fromTemporalClauses = (0, _utils.temporalPredicateClauses)(
    preparedParams.from,
    fromVariable,
    fromTemporalArgs,
    'from'
  );
  var toTemporalClauses = (0, _utils.temporalPredicateClauses)(
    preparedParams.to,
    toVariable,
    toTemporalArgs,
    'to'
  );

  var _buildCypherSelection13 = (0, _selections.buildCypherSelection)({
      initial: '',
      selections: selections,
      schemaType: schemaType,
      resolveInfo: resolveInfo,
      paramIndex: 1,
      parentSelectionInfo: {
        rootType: 'relationship',
        from: fromVar,
        to: toVar,
        variableName: lowercased
      },
      variableName: schemaType.name === fromType ? '' + toVar : '' + fromVar
    }),
    _buildCypherSelection14 = (0, _slicedToArray3.default)(
      _buildCypherSelection13,
      2
    ),
    subQuery = _buildCypherSelection14[0],
    subParams = _buildCypherSelection14[1];

  params = (0, _extends3.default)({}, preparedParams, subParams);
  var query =
    '\n      MATCH (' +
    fromVariable +
    ':' +
    fromLabel +
    (fromTemporalClauses && fromTemporalClauses.length > 0 // uses either a WHERE clause for managed type primary keys (temporal, etc.)
      ? ') WHERE ' + fromTemporalClauses.join(' AND ') + ' ' // or a an internal matching clause for normal, scalar property primary keys
      : // NOTE this will need to change if we at some point allow for multi field node selection
        ' {' + fromParam + ': $from.' + fromParam + '})') +
    '\n      MATCH (' +
    toVariable +
    ':' +
    toLabel +
    (toTemporalClauses && toTemporalClauses.length > 0
      ? ') WHERE ' + toTemporalClauses.join(' AND ') + ' '
      : ' {' + toParam + ': $to.' + toParam + '})') +
    '\n      CREATE (' +
    fromVariable +
    ')-[' +
    relationshipVariable +
    ':' +
    relationshipLabel +
    (paramStatements.length > 0 ? ' {' + paramStatements.join(',') + '}' : '') +
    ']->(' +
    toVariable +
    ')\n      RETURN ' +
    relationshipVariable +
    ' { ' +
    subQuery +
    ' } AS ' +
    schemaTypeName +
    ';\n    ';
  return [query, params];
};

var relationshipDelete = function relationshipDelete(_ref18) {
  var resolveInfo = _ref18.resolveInfo,
    selections = _ref18.selections,
    variableName = _ref18.variableName,
    schemaType = _ref18.schemaType,
    params = _ref18.params;

  var mutationMeta = void 0,
    relationshipNameArg = void 0,
    fromTypeArg = void 0,
    toTypeArg = void 0;
  try {
    mutationMeta = resolveInfo.schema
      .getMutationType()
      .getFields()
      [resolveInfo.fieldName].astNode.directives.find(function(x) {
        return x.name.value === 'MutationMeta';
      });
  } catch (e) {
    throw new Error(
      'Missing required MutationMeta directive on add relationship directive'
    );
  }

  try {
    relationshipNameArg = mutationMeta.arguments.find(function(x) {
      return x.name.value === 'relationship';
    });
    fromTypeArg = mutationMeta.arguments.find(function(x) {
      return x.name.value === 'from';
    });
    toTypeArg = mutationMeta.arguments.find(function(x) {
      return x.name.value === 'to';
    });
  } catch (e) {
    throw new Error(
      'Missing required argument in MutationMeta directive (relationship, from, or to)'
    );
  }

  //TODO: need to handle one-to-one and one-to-many
  var args = (0, _utils.getMutationArguments)(resolveInfo);
  var typeMap = resolveInfo.schema.getTypeMap();

  var fromType = fromTypeArg.value.value;
  var fromVar = (0, _utils.lowFirstLetter)(fromType) + '_from';
  var fromInputArg = args.find(function(e) {
    return e.name.value === 'from';
  }).type;
  var fromInputAst =
    typeMap[(0, _graphql.getNamedType)(fromInputArg).type.name.value].astNode;
  var fromFields = fromInputAst.fields;
  var fromParam = fromFields[0].name.value;
  var fromTemporalArgs = (0, _utils.getTemporalArguments)(fromFields);

  var toType = toTypeArg.value.value;
  var toVar = (0, _utils.lowFirstLetter)(toType) + '_to';
  var toInputArg = args.find(function(e) {
    return e.name.value === 'to';
  }).type;
  var toInputAst =
    typeMap[(0, _graphql.getNamedType)(toInputArg).type.name.value].astNode;
  var toFields = toInputAst.fields;
  var toParam = toFields[0].name.value;
  var toTemporalArgs = (0, _utils.getTemporalArguments)(toFields);

  var relationshipName = relationshipNameArg.value.value;

  var schemaTypeName = (0, _utils.safeVar)(schemaType);
  var fromVariable = (0, _utils.safeVar)(fromVar);
  var fromLabel = (0, _utils.safeLabel)(fromType);
  var toVariable = (0, _utils.safeVar)(toVar);
  var toLabel = (0, _utils.safeLabel)(toType);
  var relationshipVariable = (0, _utils.safeVar)(fromVar + toVar);
  var relationshipLabel = (0, _utils.safeLabel)(relationshipName);
  var fromRootVariable = (0, _utils.safeVar)('_' + fromVar);
  var toRootVariable = (0, _utils.safeVar)('_' + toVar);
  var fromTemporalClauses = (0, _utils.temporalPredicateClauses)(
    params.from,
    fromVariable,
    fromTemporalArgs,
    'from'
  );
  var toTemporalClauses = (0, _utils.temporalPredicateClauses)(
    params.to,
    toVariable,
    toTemporalArgs,
    'to'
  );
  // TODO cleaner semantics: remove use of _ prefixes in root variableNames and variableName

  var _buildCypherSelection15 = (0, _selections.buildCypherSelection)(
      (0, _defineProperty3.default)(
        {
          initial: '',
          selections: selections,
          variableName: variableName,
          schemaType: schemaType,
          resolveInfo: resolveInfo,
          paramIndex: 1,
          parentSelectionInfo: {
            rootType: 'relationship',
            from: '_' + fromVar,
            to: '_' + toVar
          }
        },
        'variableName',
        schemaType.name === fromType ? '_' + toVar : '_' + fromVar
      )
    ),
    _buildCypherSelection16 = (0, _slicedToArray3.default)(
      _buildCypherSelection15,
      2
    ),
    subQuery = _buildCypherSelection16[0],
    subParams = _buildCypherSelection16[1];

  params = (0, _extends3.default)({}, params, subParams);
  var query =
    '\n      MATCH (' +
    fromVariable +
    ':' +
    fromLabel +
    (fromTemporalClauses && fromTemporalClauses.length > 0 // uses either a WHERE clause for managed type primary keys (temporal, etc.)
      ? ') WHERE ' + fromTemporalClauses.join(' AND ') + ' ' // or a an internal matching clause for normal, scalar property primary keys
      : ' {' + fromParam + ': $from.' + fromParam + '})') +
    '\n      MATCH (' +
    toVariable +
    ':' +
    toLabel +
    (toTemporalClauses && toTemporalClauses.length > 0
      ? ') WHERE ' + toTemporalClauses.join(' AND ') + ' '
      : ' {' + toParam + ': $to.' + toParam + '})') +
    '\n      OPTIONAL MATCH (' +
    fromVariable +
    ')-[' +
    relationshipVariable +
    ':' +
    relationshipLabel +
    ']->(' +
    toVariable +
    ')\n      DELETE ' +
    relationshipVariable +
    '\n      WITH COUNT(*) AS scope, ' +
    fromVariable +
    ' AS ' +
    fromRootVariable +
    ', ' +
    toVariable +
    ' AS ' +
    toRootVariable +
    '\n      RETURN {' +
    subQuery +
    '} AS ' +
    schemaTypeName +
    ';\n    ';
  return [query, params];
};

var temporalTypeSelections = function temporalTypeSelections(
  selections,
  innerSchemaType
) {
  // TODO use extractSelections instead?
  var selectedTypes =
    selections && selections[0] && selections[0].selectionSet
      ? selections[0].selectionSet.selections
      : [];
  return selectedTypes
    .reduce(function(temporalTypeFields, innerSelection) {
      // name of temporal type field
      var fieldName = innerSelection.name.value;
      var fieldTypeName = getFieldTypeName(innerSchemaType, fieldName);
      if ((0, _utils.isTemporalType)(fieldTypeName)) {
        var innerSelectedTypes = innerSelection.selectionSet
          ? innerSelection.selectionSet.selections
          : [];
        temporalTypeFields.push(
          fieldName +
            ': {' +
            innerSelectedTypes
              .reduce(function(temporalSubFields, t) {
                // temporal type subfields, year, minute, etc.
                var subFieldName = t.name.value;
                if (subFieldName === 'formatted') {
                  temporalSubFields.push(
                    subFieldName + ': toString(sortedElement.' + fieldName + ')'
                  );
                } else {
                  temporalSubFields.push(
                    subFieldName +
                      ': sortedElement.' +
                      fieldName +
                      '.' +
                      subFieldName
                  );
                }
                return temporalSubFields;
              }, [])
              .join(',') +
            '}'
        );
      }
      return temporalTypeFields;
    }, [])
    .join(',');
};

var getFieldTypeName = function getFieldTypeName(schemaType, fieldName) {
  // TODO handle for fragments?
  var field =
    schemaType && fieldName ? schemaType.getFields()[fieldName] : undefined;
  return field ? field.type.name : '';
};

var temporalOrderingFieldExists = function temporalOrderingFieldExists(
  schemaType,
  filterParams
) {
  var orderByParam = filterParams ? filterParams['orderBy'] : undefined;
  if (orderByParam) {
    orderByParam = orderByParam.value;
    if (!Array.isArray(orderByParam)) orderByParam = [orderByParam];
    return orderByParam.find(function(e) {
      var fieldName = e.substring(0, e.indexOf('_'));
      var fieldTypeName = getFieldTypeName(schemaType, fieldName);
      return (0, _utils.isTemporalType)(fieldTypeName);
    });
  }
  return undefined;
};

var buildSortMultiArgs = function buildSortMultiArgs(param) {
  var values = param ? param.value : [];
  var fieldName = '';
  if (!Array.isArray(values)) values = [values];
  return values
    .map(function(e) {
      fieldName = e.substring(0, e.indexOf('_'));
      return e.includes('_asc')
        ? "'^" + fieldName + "'"
        : "'" + fieldName + "'";
    })
    .join(',');
};

var buildFilterPredicates = function buildFilterPredicates(
  fieldArgs,
  schemaType,
  variableName,
  resolveInfo,
  params,
  paramIndex
) {
  var filterArg = fieldArgs.find(function(e) {
    return e.name.value === 'filter';
  });
  var filterValue = (0, _keys2.default)(params).length
    ? params['filter']
    : undefined;
  var filterPredicates = [];
  // if field has both a filter argument and argument data is provided
  if (filterArg && filterValue) {
    var schema = resolveInfo.schema;
    var typeName = (0, _graphql.getNamedType)(filterArg).type.name.value;
    var filterSchemaType = schema.getType(typeName);
    // get fields of filter type
    var typeFields = filterSchemaType.getFields();
    // align with naming scheme of extracted argument Cypher params
    var filterParam =
      paramIndex > 1 ? '$' + (paramIndex - 1) + '_filter' : '$filter';
    // recursively translate argument filterParam relative to schemaType
    filterPredicates = translateFilterArguments(
      schemaType,
      variableName,
      typeFields,
      filterParam,
      schema,
      filterValue
    );
  }
  return filterPredicates;
};

var translateFilterArguments = function translateFilterArguments(
  schemaType,
  variableName,
  typeFields,
  filterParam,
  schema,
  filterValue,
  parentVariableName
) {
  // root call to translateFilterArgument, recursive calls in buildUniquePredicates
  // translates each provided filter relative to its corresponding field in typeFields
  return (0, _entries2.default)(filterValue).reduce(function(
    predicates,
    _ref19
  ) {
    var _ref20 = (0, _slicedToArray3.default)(_ref19, 2),
      name = _ref20[0],
      value = _ref20[1];

    var predicate = translateFilterArgument({
      parentVariableName: parentVariableName,
      field: typeFields[name],
      filterValue: value,
      fieldName: name,
      variableName: variableName,
      filterParam: filterParam,
      schemaType: schemaType,
      schema: schema
    });
    if (predicate) predicates.push('(' + predicate + ')');
    return predicates;
  },
  []);
};

var translateFilterArgument = function translateFilterArgument(_ref21) {
  var parentVariableName = _ref21.parentVariableName,
    isListFilterArgument = _ref21.isListFilterArgument,
    field = _ref21.field,
    filterValue = _ref21.filterValue,
    fieldName = _ref21.fieldName,
    variableName = _ref21.variableName,
    filterParam = _ref21.filterParam,
    schemaType = _ref21.schemaType,
    schema = _ref21.schema;

  var fieldType = field.type;
  var innerFieldType = (0, _utils.innerType)(fieldType);
  // get name of filter field type (ex: _PersonFilter)
  var typeName = innerFieldType.name;
  // build path for parameter data for current filter field
  var parameterPath =
    (parentVariableName ? parentVariableName : filterParam) + '.' + fieldName;
  // parse field name into prefix (ex: name, company) and
  // possible suffix identifying operation type (ex: _gt, _in)
  var parsedFilterName = parseFilterArgumentName(fieldName);
  var filterOperationField = parsedFilterName.name;
  var filterOperationType = parsedFilterName.type;
  // short-circuit evaluation: predicate used to skip a field
  // if processing a list of objects that possibly contain different arguments
  var nullFieldPredicate = decideNullSkippingPredicate({
    parameterPath: parameterPath,
    isListFilterArgument: isListFilterArgument,
    parentVariableName: parentVariableName
  });
  if (
    (0, _graphql.isScalarType)(innerFieldType) ||
    (0, _graphql.isEnumType)(innerFieldType)
  ) {
    // translations of scalar type filters are simply relative
    // to their field name suffix, filterOperationType
    return translateScalarFilter({
      isListFilterArgument: isListFilterArgument,
      filterOperationField: filterOperationField,
      filterOperationType: filterOperationType,
      filterValue: filterValue,
      variableName: variableName,
      parameterPath: parameterPath,
      parentVariableName: parentVariableName,
      filterParam: filterParam,
      nullFieldPredicate: nullFieldPredicate
    });
  } else if ((0, _graphql.isInputType)(innerFieldType)) {
    // translations of input type filters decide arguments for a call to buildPredicateFunction
    return translateInputFilter({
      isListFilterArgument: isListFilterArgument,
      filterOperationField: filterOperationField,
      filterOperationType: filterOperationType,
      filterValue: filterValue,
      variableName: variableName,
      fieldName: fieldName,
      filterParam: filterParam,
      typeName: typeName,
      fieldType: fieldType,
      schema: schema,
      schemaType: schemaType,
      parameterPath: parameterPath,
      parentVariableName: parentVariableName,
      nullFieldPredicate: nullFieldPredicate
    });
  }
};

var parseFilterArgumentName = function parseFilterArgumentName(fieldName) {
  var fieldNameParts = fieldName.split('_');
  var filterType = '';
  if (fieldNameParts.length > 1) {
    fieldName = fieldNameParts.shift();
    filterType = fieldNameParts.join('_');
  }
  return {
    name: fieldName,
    type: filterType
  };
};

var translateScalarFilter = function translateScalarFilter(_ref22) {
  var isListFilterArgument = _ref22.isListFilterArgument,
    filterOperationField = _ref22.filterOperationField,
    filterOperationType = _ref22.filterOperationType,
    filterValue = _ref22.filterValue,
    variableName = _ref22.variableName,
    parameterPath = _ref22.parameterPath,
    parentVariableName = _ref22.parentVariableName,
    filterParam = _ref22.filterParam,
    nullFieldPredicate = _ref22.nullFieldPredicate;

  var safeVariableName = (0, _utils.safeVar)(variableName);
  // build path to node/relationship property
  var propertyPath = safeVariableName + '.' + filterOperationField;
  if (isExistentialFilter(filterOperationType, filterValue)) {
    return translateNullFilter({
      propertyPath: propertyPath,
      filterOperationField: filterOperationField,
      filterOperationType: filterOperationType,
      filterParam: filterParam,
      parentVariableName: parentVariableName,
      isListFilterArgument: isListFilterArgument
    });
  }
  // some object arguments in an array filter may differ internally
  // so skip the field predicate if a corresponding value is not provided
  return (
    '' +
    nullFieldPredicate +
    buildScalarFilterPredicate(filterOperationType, propertyPath) +
    ' ' +
    parameterPath
  );
};

var isExistentialFilter = function isExistentialFilter(type, value) {
  return (!type || type === 'not') && value === null;
};

var decideNullSkippingPredicate = function decideNullSkippingPredicate(_ref23) {
  var parameterPath = _ref23.parameterPath,
    isListFilterArgument = _ref23.isListFilterArgument,
    parentVariableName = _ref23.parentVariableName;
  return isListFilterArgument && parentVariableName
    ? parameterPath + ' IS NULL OR '
    : '';
};

var translateNullFilter = function translateNullFilter(_ref24) {
  var filterOperationField = _ref24.filterOperationField,
    filterOperationType = _ref24.filterOperationType,
    filterParam = _ref24.filterParam,
    propertyPath = _ref24.propertyPath,
    parentVariableName = _ref24.parentVariableName,
    isListFilterArgument = _ref24.isListFilterArgument;

  var isNegationFilter = filterOperationType === 'not';
  // allign with modified parameter names for null filters
  var paramPath =
    (parentVariableName ? parentVariableName : filterParam) +
    '._' +
    filterOperationField +
    '_' +
    (isNegationFilter ? 'not_' : '') +
    'null';
  // build a predicate for checking the existence of a
  // property or relationship
  var predicate =
    paramPath +
    ' = TRUE AND' +
    (isNegationFilter ? '' : ' NOT') +
    ' EXISTS(' +
    propertyPath +
    ')';
  // skip the field if it is null in the case of it
  // existing within one of many objects in a list filter
  var nullFieldPredicate = decideNullSkippingPredicate({
    parameterPath: paramPath,
    isListFilterArgument: isListFilterArgument,
    parentVariableName: parentVariableName
  });
  return '' + nullFieldPredicate + predicate;
};

var buildScalarFilterPredicate = function buildScalarFilterPredicate(
  filterOperationType,
  propertyPath
) {
  switch (filterOperationType) {
    case 'not':
      return 'NOT ' + propertyPath + ' = ';
    case 'in':
      return propertyPath + ' IN';
    case 'not_in':
      return 'NOT ' + propertyPath + ' IN';
    case 'contains':
      return propertyPath + ' CONTAINS';
    case 'not_contains':
      return 'NOT ' + propertyPath + ' CONTAINS';
    case 'starts_with':
      return propertyPath + ' STARTS WITH';
    case 'not_starts_with':
      return 'NOT ' + propertyPath + ' STARTS WITH';
    case 'ends_with':
      return propertyPath + ' ENDS WITH';
    case 'not_ends_with':
      return 'NOT ' + propertyPath + ' ENDS WITH';
    case 'lt':
      return propertyPath + ' <';
    case 'lte':
      return propertyPath + ' <=';
    case 'gt':
      return propertyPath + ' >';
    case 'gte':
      return propertyPath + ' >=';
    default:
      return propertyPath + ' =';
  }
};

var translateInputFilter = function translateInputFilter(_ref25) {
  var isListFilterArgument = _ref25.isListFilterArgument,
    filterOperationField = _ref25.filterOperationField,
    filterOperationType = _ref25.filterOperationType,
    filterValue = _ref25.filterValue,
    variableName = _ref25.variableName,
    fieldName = _ref25.fieldName,
    filterParam = _ref25.filterParam,
    typeName = _ref25.typeName,
    fieldType = _ref25.fieldType,
    schema = _ref25.schema,
    schemaType = _ref25.schemaType,
    parameterPath = _ref25.parameterPath,
    parentVariableName = _ref25.parentVariableName,
    nullFieldPredicate = _ref25.nullFieldPredicate;

  var filterSchemaType = schema.getType(typeName);
  var typeFields = filterSchemaType.getFields();
  if (filterOperationField === 'AND' || filterOperationField === 'OR') {
    return translateLogicalFilter({
      filterValue: filterValue,
      variableName: variableName,
      filterOperationField: filterOperationField,
      fieldName: fieldName,
      filterParam: filterParam,
      typeFields: typeFields,
      schema: schema,
      schemaType: schemaType,
      parameterPath: parameterPath,
      parentVariableName: parentVariableName,
      isListFilterArgument: isListFilterArgument,
      nullFieldPredicate: nullFieldPredicate
    });
  } else {
    var _relationDirective = (0, _utils.relationDirective)(
        schemaType,
        filterOperationField
      ),
      relLabel = _relationDirective.name,
      relDirection = _relationDirective.direction;

    if (relLabel && relDirection) {
      return translateRelationshipFilter({
        relLabel: relLabel,
        relDirection: relDirection,
        filterValue: filterValue,
        variableName: variableName,
        filterOperationField: filterOperationField,
        filterOperationType: filterOperationType,
        fieldName: fieldName,
        filterParam: filterParam,
        typeFields: typeFields,
        fieldType: fieldType,
        schema: schema,
        schemaType: schemaType,
        parameterPath: parameterPath,
        parentVariableName: parentVariableName,
        isListFilterArgument: isListFilterArgument,
        nullFieldPredicate: nullFieldPredicate
      });
    }
  }
};

var translateLogicalFilter = function translateLogicalFilter(_ref26) {
  var filterValue = _ref26.filterValue,
    variableName = _ref26.variableName,
    filterOperationField = _ref26.filterOperationField,
    fieldName = _ref26.fieldName,
    filterParam = _ref26.filterParam,
    typeFields = _ref26.typeFields,
    schema = _ref26.schema,
    schemaType = _ref26.schemaType,
    parameterPath = _ref26.parameterPath,
    parentVariableName = _ref26.parentVariableName,
    isListFilterArgument = _ref26.isListFilterArgument,
    nullFieldPredicate = _ref26.nullFieldPredicate;

  var listElementVariable = '_' + fieldName;
  var predicateListVariable = parameterPath;
  // build predicate expressions for all unique arguments within filterValue
  // isListFilterArgument is true here so that nullFieldPredicate is used
  var predicates = buildUniquePredicates({
    schemaType: schemaType,
    variableName: variableName,
    listVariable: listElementVariable,
    filterValue: filterValue,
    filterParam: filterParam,
    typeFields: typeFields,
    schema: schema,
    isListFilterArgument: true
  });
  // decide root predicate function
  var rootPredicateFunction = decidePredicateFunction({
    filterOperationField: filterOperationField
  });
  // build root predicate expression
  return buildPredicateFunction({
    listElementVariable: listElementVariable,
    parameterPath: parameterPath,
    parentVariableName: parentVariableName,
    rootPredicateFunction: rootPredicateFunction,
    predicateListVariable: predicateListVariable,
    predicates: predicates,
    isListFilterArgument: isListFilterArgument,
    nullFieldPredicate: nullFieldPredicate
  });
};

var translateRelationshipFilter = function translateRelationshipFilter(_ref27) {
  var relLabel = _ref27.relLabel,
    relDirection = _ref27.relDirection,
    filterValue = _ref27.filterValue,
    variableName = _ref27.variableName,
    filterOperationField = _ref27.filterOperationField,
    filterOperationType = _ref27.filterOperationType,
    fieldName = _ref27.fieldName,
    filterParam = _ref27.filterParam,
    typeFields = _ref27.typeFields,
    fieldType = _ref27.fieldType,
    schema = _ref27.schema,
    schemaType = _ref27.schemaType,
    parameterPath = _ref27.parameterPath,
    parentVariableName = _ref27.parentVariableName,
    isListFilterArgument = _ref27.isListFilterArgument,
    nullFieldPredicate = _ref27.nullFieldPredicate;

  // get related type for relationship variables and pattern
  var innerSchemaType = (0, _utils.innerType)(
    schemaType.getFields()[filterOperationField].type
  );
  // build safe relationship variables

  var _typeIdentifiers = (0, _utils.typeIdentifiers)(innerSchemaType),
    relatedTypeName = _typeIdentifiers.typeName,
    relatedTypeNameLow = _typeIdentifiers.variableName;
  // because ALL(n IN [] WHERE n) currently returns true
  // an existence predicate is added to make sure a relationship exists
  // otherwise a node returns when it has 0 such relationships, since the
  // predicate function then evaluates an empty list

  var pathExistencePredicate = buildRelationshipExistencePath(
    variableName,
    relLabel,
    relDirection,
    relatedTypeName
  );
  if (isExistentialFilter(filterOperationType, filterValue)) {
    return translateNullFilter({
      propertyPath: pathExistencePredicate,
      filterOperationField: filterOperationField,
      filterOperationType: filterOperationType,
      filterParam: filterParam,
      parentVariableName: parentVariableName,
      isListFilterArgument: isListFilterArgument
    });
  }
  var schemaTypeNameLow = schemaType.name.toLowerCase();
  var safeRelVariableName = (0, _utils.safeVar)(
    schemaTypeNameLow + '_filter_' + relatedTypeNameLow
  );
  var safeRelatedTypeNameLow = (0, _utils.safeVar)(relatedTypeNameLow);
  // build a list comprehension containing path pattern for related type
  var predicateListVariable = buildRelationshipListPattern({
    fromVar: schemaTypeNameLow,
    relVar: safeRelVariableName,
    relLabel: relLabel,
    relDirection: relDirection,
    toVar: relatedTypeNameLow,
    toLabel: relatedTypeName,
    fieldName: fieldName
  });
  // decide root predicate function
  var rootPredicateFunction = decidePredicateFunction({
    filterOperationField: filterOperationField,
    filterOperationType: filterOperationType,
    isRelation: true
  });
  var predicates = '';
  if ((0, _graphql.isListType)(fieldType)) {
    var listVariable = '_' + fieldName;
    predicates = buildUniquePredicates({
      isListFilterArgument: true,
      schemaType: innerSchemaType,
      variableName: relatedTypeNameLow,
      listVariable: listVariable,
      filterValue: filterValue,
      filterParam: filterParam,
      typeFields: typeFields,
      schema: schema
    });
    // build root predicate to contain nested predicate
    predicates =
      rootPredicateFunction +
      '(' +
      listVariable +
      ' IN ' +
      parameterPath +
      ' WHERE (' +
      predicates +
      '))';
    // change root predicate to ALL to act as a boolean
    // evaluation of the above nested rootPredicateFunction
    rootPredicateFunction = 'ALL';
  } else {
    predicates = buildUniquePredicates({
      schemaType: innerSchemaType,
      variableName: relatedTypeNameLow,
      listVariable: parameterPath,
      filterValue: filterValue,
      filterParam: filterParam,
      typeFields: typeFields,
      schema: schema
    });
  }
  return buildPredicateFunction({
    listElementVariable: safeRelatedTypeNameLow,
    parameterPath: parameterPath,
    parentVariableName: parentVariableName,
    rootPredicateFunction: rootPredicateFunction,
    predicateListVariable: predicateListVariable,
    predicates: predicates,
    pathExistencePredicate: pathExistencePredicate,
    isListFilterArgument: isListFilterArgument,
    nullFieldPredicate: nullFieldPredicate
  });
};

var buildPredicateFunction = function buildPredicateFunction(_ref28) {
  var listElementVariable = _ref28.listElementVariable,
    rootPredicateFunction = _ref28.rootPredicateFunction,
    predicateListVariable = _ref28.predicateListVariable,
    predicates = _ref28.predicates,
    pathExistencePredicate = _ref28.pathExistencePredicate,
    nullFieldPredicate = _ref28.nullFieldPredicate;

  // https://neo4j.com/docs/cypher-manual/current/functions/predicate/
  return (
    '' +
    nullFieldPredicate +
    (pathExistencePredicate
      ? 'EXISTS(' + pathExistencePredicate + ') AND '
      : '') +
    rootPredicateFunction +
    '(' +
    listElementVariable +
    ' IN ' +
    predicateListVariable +
    ' WHERE ' +
    predicates +
    ')'
  );
};

var decidePredicateFunction = function decidePredicateFunction(_ref29) {
  var filterOperationField = _ref29.filterOperationField,
    filterOperationType = _ref29.filterOperationType,
    isRelation = _ref29.isRelation;

  if (filterOperationField === 'AND') return 'ALL';
  else if (filterOperationField === 'OR') return 'ANY';
  else if (isRelation) {
    switch (filterOperationType) {
      case 'not':
        return 'NONE';
      case 'in':
        return 'ANY';
      case 'not_in':
        return 'NONE';
      case 'some':
        return 'ANY';
      case 'every':
        return 'ALL';
      case 'none':
        return 'NONE';
      case 'single':
        return 'SINGLE';
      default:
        return 'ALL';
    }
  }
};

var buildRelationshipListPattern = function buildRelationshipListPattern(
  _ref30
) {
  var fromVar = _ref30.fromVar,
    relVar = _ref30.relVar,
    relLabel = _ref30.relLabel,
    relDirection = _ref30.relDirection,
    toVar = _ref30.toVar,
    toLabel = _ref30.toLabel;

  // prevents related node variable from
  // conflicting with parent variables
  toVar = '_' + toVar;
  var safeFromVar = (0, _utils.safeVar)(fromVar);
  var safeToVar = (0, _utils.safeVar)(toVar);
  // builds a path pattern within a list comprehension
  // that extracts related nodes
  return (
    '[(' +
    safeFromVar +
    ')' +
    (relDirection === 'IN' ? '<' : '') +
    '-[' +
    relVar +
    ':' +
    relLabel +
    ']-' +
    (relDirection === 'OUT' ? '>' : '') +
    '(' +
    safeToVar +
    ':' +
    toLabel +
    ') | ' +
    safeToVar +
    ']'
  );
};

var buildRelationshipExistencePath = function buildRelationshipExistencePath(
  fromVar,
  relLabel,
  relDirection,
  toType
) {
  var safeFromVar = (0, _utils.safeVar)(fromVar);
  return (
    '(' +
    safeFromVar +
    ')' +
    (relDirection === 'IN' ? '<' : '') +
    '-[:' +
    relLabel +
    ']-' +
    (relDirection === 'OUT' ? '>' : '') +
    '(:' +
    toType +
    ')'
  );
};

var decideFilterParamName = function decideFilterParamName(name, value) {
  if (value === null) {
    var parsedFilterName = parseFilterArgumentName(name);
    var filterOperationType = parsedFilterName.type;
    if (!filterOperationType || filterOperationType === 'not') {
      return '_' + name + '_null';
    }
  }
  return name;
};

var buildUniquePredicates = function buildUniquePredicates(_ref31) {
  var schemaType = _ref31.schemaType,
    variableName = _ref31.variableName,
    listVariable = _ref31.listVariable,
    filterValue = _ref31.filterValue,
    filterParam = _ref31.filterParam,
    typeFields = _ref31.typeFields,
    schema = _ref31.schema,
    _ref31$isListFilterAr = _ref31.isListFilterArgument,
    isListFilterArgument =
      _ref31$isListFilterAr === undefined ? false : _ref31$isListFilterAr;

  // coercion of object argument to array for general use of reduce
  if (!Array.isArray(filterValue)) filterValue = [filterValue];
  // used to prevent building a duplicate translation when
  // the same filter field is provided in multiple objects
  var translatedFilters = {};
  // recursion: calls translateFilterArgument for every field
  return filterValue
    .reduce(function(predicates, filter) {
      (0, _entries2.default)(filter).forEach(function(_ref32) {
        var _ref33 = (0, _slicedToArray3.default)(_ref32, 2),
          name = _ref33[0],
          value = _ref33[1];

        var filterParamName = decideFilterParamName(name, value);
        if (!translatedFilters[filterParamName]) {
          var predicate = translateFilterArgument({
            isListFilterArgument: isListFilterArgument,
            parentVariableName: listVariable,
            field: typeFields[name],
            filterValue: value,
            fieldName: name,
            variableName: variableName,
            filterParam: filterParam,
            schemaType: schemaType,
            schema: schema
          });
          if (predicate) {
            translatedFilters[filterParamName] = true;
            predicates.push('(' + predicate + ')');
          }
        }
      });
      return predicates;
    }, [])
    .join(' AND ');
};

var transformExistentialFilterParams = (exports.transformExistentialFilterParams = function transformExistentialFilterParams(
  filterParam
) {
  return (0, _entries2.default)(filterParam).reduce(function(acc, _ref34) {
    var _ref35 = (0, _slicedToArray3.default)(_ref34, 2),
      key = _ref35[0],
      value = _ref35[1];

    var parsed = parseFilterArgumentName(key);
    var filterOperationType = parsed.type;
    // align with parameter naming scheme used during translation
    if (isExistentialFilter(filterOperationType, value)) {
      // name: null -> _name_null: true
      // company_not: null -> _company_not_null: true
      key = decideFilterParamName(key, value);
      value = true;
    } else if (
      (typeof value === 'undefined'
        ? 'undefined'
        : (0, _typeof3.default)(value)) === 'object'
    ) {
      // recurse: array filter
      if (Array.isArray(value)) {
        value = value.map(function(filter) {
          // prevent recursing for scalar list filters
          if (
            (typeof filter === 'undefined'
              ? 'undefined'
              : (0, _typeof3.default)(filter)) === 'object'
          ) {
            return transformExistentialFilterParams(filter);
          }
          return filter;
        });
      } else {
        // recurse: object filter
        value = transformExistentialFilterParams(value);
      }
    }
    acc[key] = value;
    return acc;
  }, {});
});
