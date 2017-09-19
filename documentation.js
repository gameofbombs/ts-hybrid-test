"use strict";
exports.__esModule = true;
var ts = require("typescript");
var fs = require("fs");
/** Generate documentation for all classes in a set of .ts files */
function generateDocumentation(fileNames, options) {
    // Build a program using the set of root file names in fileNames
    var program = ts.createProgram(fileNames, options);
    // Get the checker, we will use it to find more about classes
    var checker = program.getTypeChecker();
    var output = [];
    // Visit every sourceFile in the program
    for (var _i = 0, _a = program.getSourceFiles(); _i < _a.length; _i++) {
        var sourceFile = _a[_i];
        // Walk the tree to search for classes
        ts.forEachChild(sourceFile, visit);
    }
    console.log(output);
    // print out the doc
    fs.writeFileSync("classes.json", JSON.stringify(output, undefined, 4));
    return;
    /** visit nodes finding exported classes */
    function visit(node) {
        var path = node.getSourceFile()['path'].toString();
        if (!path.includes('pepe.ts')) {
            return;
        }
        if (node.kind === ts.SyntaxKind.ClassDeclaration) {
            // This is a top level class, get its symbol
            var symbol = checker.getSymbolAtLocation(node.name);
            var stuff = serializeClass(symbol);
            if (node.heritageClauses) {
                for (var _i = 0, _a = node.heritageClauses; _i < _a.length; _i++) {
                    var heritage = _a[_i];
                    if (heritage.token === ts.SyntaxKind.ExtendsKeyword) {
                        var identifier = void 0;
                        if (heritage) {
                            identifier = heritage.types[0].expression;
                        }
                        else {
                            identifier = heritage.types[0].expression.name;
                        }
                        var heritageSymbol = checker.getSymbolAtLocation(identifier);
                        stuff.parentClass = getFqcnBySymbol(heritageSymbol);
                    }
                }
            }
            stuff.moduleName = getFqcnBySymbol(symbol);
            output.push(stuff);
            // No need to walk any further, class expressions/inner declarations
            // cannot be exported
        }
        else if (node.kind === ts.SyntaxKind.ModuleDeclaration || node.kind === ts.SyntaxKind.ModuleBlock) {
            // This is a namespace, visit its children
        }
        ts.forEachChild(node, visit);
    }
    /** Serialize a symbol into a json object */
    function serializeSymbol(symbol) {
        return {
            name: symbol.getName(),
            documentation: ts.displayPartsToString(symbol.getDocumentationComment()),
            type: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration))
        };
    }
    /** Serialize a class symbol information */
    function serializeClass(symbol) {
        var details = serializeSymbol(symbol);
        // Get the construct signatures
        var constructorType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
        details.constructors = constructorType.getConstructSignatures().map(serializeSignature);
        return details;
    }
    function getFqcnBySymbol(symbol) {
        var fqcn = [];
        var previous = symbol;
        if (previous.declarations[0].kind === ts.SyntaxKind.ImportEqualsDeclaration) {
            return getFqcnByQN(previous.declarations[0]['moduleReference']);
        }
        while (true) {
            fqcn.unshift(previous.name);
            previous = previous['parent'];
            if (!previous) {
                break;
            }
        }
        fqcn.shift();
        return fqcn.join('.');
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
    /** Serialize a signature (call or construct) */
    function serializeSignature(signature) {
        return {
            parameters: signature.parameters.map(serializeSymbol),
            returnType: checker.typeToString(signature.getReturnType()),
            documentation: ts.displayPartsToString(signature.getDocumentationComment())
        };
    }
    /** True if this is visible outside this file, false otherwise */
    function isNodeExported(node) {
        return (node.flags & ts.NodeFlags.ExportContext) !== 0 || (node.parent && node.parent.kind === ts.SyntaxKind.SourceFile);
    }
}
generateDocumentation(process.argv.slice(2), {
    target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS
});
