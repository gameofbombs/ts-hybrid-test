#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var ts = require("typescript");
var glob = require("glob");
var fs = require("fs");
var bundleName = process.argv.slice(3).toString();
var bundleNameTs = bundleName.replace('.js', '.ts');
var sourcesDir = process.argv.slice(2, -1).toString();
/** Generate documentation for all classes in a set of .ts files */
function generateClassMetadata(fileNames, options) {
    // Build a program using the set of root file names in fileNames
    var program = ts.createProgram(fileNames, options);
    // Get the checker, we will use it to find more about classes
    var checker = program.getTypeChecker();
    var output = {};
    // Visit every sourceFile in the program
    for (var _i = 0, _a = program.getSourceFiles(); _i < _a.length; _i++) {
        var sourceFile = _a[_i];
        // Walk the tree to search for classes
        ts.forEachChild(sourceFile, visit);
    }
    return output;
    /** visit nodes finding exported classes */
    function visit(node) {
        var path = node.getSourceFile()['path'].toString();
        if (path.includes('node_modules') || !path.includes(sourcesDir)) {
            return;
        }
        if (node.kind === ts.SyntaxKind.ClassDeclaration) {
            // This is a top level class, get its symbol
            var symbol = checker.getSymbolAtLocation(node.name);
            var classMetadata = serializeClass(symbol);
            classMetadata.text = node.getSourceFile().text;
            var classFqcn = getFqcnBySymbol(symbol);
            classMetadata.moduleName = classFqcn.join('.');
            if (node.heritageClauses) {
                for (var _i = 0, _a = node.heritageClauses; _i < _a.length; _i++) {
                    var heritage = _a[_i];
                    if (heritage.token === ts.SyntaxKind.ExtendsKeyword) {
                        var identifier = void 0;
                        if (heritage) {
                            identifier = heritage.types[0].expression;
                        }
                        var heritageSymbol = checker.getSymbolAtLocation(identifier);
                        if (!heritageSymbol) {
                            if (identifier.kind === ts.SyntaxKind.Identifier) {
                                classMetadata.parentClass = classFqcn.slice(0, -1).join('.') + '.' + identifier.text;
                            }
                            else {
                                classMetadata.parentClass = getFqcnByPropertyAccess(identifier);
                            }
                        }
                        else {
                            classMetadata.parentClass = getFqcnBySymbol(heritageSymbol).join('.');
                        }
                    }
                }
            }
            output[classMetadata.moduleName] = classMetadata;
        }
        ts.forEachChild(node, visit);
    }
    /** Serialize a symbol into a json object */
    function serializeClass(symbol) {
        return {
            name: symbol.getName(),
            text: '',
            children: {}
        };
    }
    function getFqcnBySymbol(symbol) {
        var fqcn = [];
        var previous = symbol;
        if (previous && previous.declarations && previous.declarations[0].kind === ts.SyntaxKind.ImportEqualsDeclaration) {
            return getFqcnByQN(previous.declarations[0]['moduleReference']).split('.');
        }
        while (true) {
            fqcn.unshift(previous.name);
            previous = previous['parent'];
            if (!previous) {
                break;
            }
        }
        fqcn.shift();
        return fqcn;
    }
    function getFqcnByQN(qn) {
        var fqcn = [];
        var pickIt = function (qn) {
            if (!qn.left.hasOwnProperty('text')) {
                pickIt(qn.left);
            }
            else {
                fqcn.unshift(qn.left['text']);
            }
            fqcn.push(qn.right.text);
        };
        pickIt(qn);
        return fqcn.join('.');
    }
    function getFqcnByPropertyAccess(property) {
        var fqcn = [];
        var pickIt = function (qn) {
            if (qn.hasOwnProperty('expression')) {
                pickIt(qn.expression);
            }
            else {
                fqcn.unshift(qn['text']);
            }
            if (qn.hasOwnProperty('name')) {
                fqcn.push(qn.name.text);
            }
        };
        pickIt(property);
        return fqcn.join('.');
    }
}
var globInstance = new glob.GlobSync(sourcesDir + '/**/*.ts');
var metadata = generateClassMetadata(globInstance.found, {
    target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.CommonJS
});
function hasChildren(moduleNameSearch, metadata) {
    for (var moduleName in metadata) {
        var entry = metadata[moduleName];
        if (entry.parentClass === moduleNameSearch) {
            return true;
        }
    }
    return false;
}
function unflattenMetadata(metadata) {
    for (var moduleName in metadata) {
        var entry = metadata[moduleName];
        if (!hasChildren(entry.moduleName, metadata)) {
            var parent_1 = metadata[entry.parentClass];
            if (!parent_1) {
                continue;
            }
            parent_1.children[moduleName] = entry;
            delete metadata[moduleName];
            unflattenMetadata(metadata);
        }
    }
}
function concatSources(metadata) {
    var data = [];
    for (var moduleName in metadata) {
        var entry = metadata[moduleName];
        data.push(entry.text);
        data.push(concatSources(entry.children));
    }
    return data.join('');
}
unflattenMetadata(metadata);
var sources = concatSources(metadata);
var transpiled = ts.transpileModule(sources, {
    compilerOptions: {
        module: ts.ModuleKind.None,
        target: ts.ScriptTarget.ES5,
        sourceMap: true,
        strict: true
    },
    fileName: bundleNameTs
});
fs.writeFileSync(bundleNameTs, sources);
fs.writeFileSync(bundleName, transpiled.outputText);
fs.writeFileSync(bundleName + '.map', transpiled.sourceMapText);
