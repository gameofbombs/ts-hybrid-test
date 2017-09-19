import * as ts from "typescript";
import * as fs from "fs";

interface DocEntry {
    name?: string,
    fileName?: string,
    documentation?: string,
    type?: string,
    constructors?: DocEntry[],
    parameters?: DocEntry[],
    returnType?: string,
    moduleName?: string,
    parentClass?: string
}

/** Generate documentation for all classes in a set of .ts files */
function generateDocumentation(fileNames: string[], options: ts.CompilerOptions): void {
    // Build a program using the set of root file names in fileNames
    let program = ts.createProgram(fileNames, options);

    // Get the checker, we will use it to find more about classes
    let checker = program.getTypeChecker();

    let output: DocEntry[] = [];

    // Visit every sourceFile in the program
    for (const sourceFile of program.getSourceFiles()) {
        // Walk the tree to search for classes
        ts.forEachChild(sourceFile, visit);
    }

    console.log(output);

    // print out the doc
    fs.writeFileSync("classes.json", JSON.stringify(output, undefined, 4));

    return;

    /** visit nodes finding exported classes */
    function visit(node: ts.Node) {
        const path = node.getSourceFile()['path'].toString();

        if (!path.includes('pepe.ts')) {
            return;
        }

        if (node.kind === ts.SyntaxKind.ClassDeclaration) {
            // This is a top level class, get its symbol
            let symbol = checker.getSymbolAtLocation((<ts.ClassDeclaration>node).name);
            let stuff = serializeClass(symbol);

            if ((<ts.ClassDeclaration>node).heritageClauses) {
                for (let heritage of (<ts.ClassDeclaration>node).heritageClauses) {
                    if (heritage.token === ts.SyntaxKind.ExtendsKeyword) {

                        let identifier;

                        if (heritage) {
                            identifier = heritage.types[0].expression;
                        } else {
                            identifier = heritage.types[0].expression.name;
                        }

                        let heritageSymbol = checker.getSymbolAtLocation(identifier);

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
    function serializeSymbol(symbol: ts.Symbol): DocEntry {
        return {
            name: symbol.getName(),
            documentation: ts.displayPartsToString(symbol.getDocumentationComment()),
            type: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)),
        };
    }

    /** Serialize a class symbol information */
    function serializeClass(symbol: ts.Symbol) {
        let details = serializeSymbol(symbol);

        // Get the construct signatures
        let constructorType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
        details.constructors = constructorType.getConstructSignatures().map(serializeSignature);
        return details;
    }

    function getFqcnBySymbol(symbol: ts.Symbol) {
        let fqcn = [];
        let previous = symbol;

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

    function getFqcnByQN(qn: ts.QualifiedName)
    {
        let fqcn = [];

        const pickIt = (qn: ts.QualifiedName) => {
            if (!qn.left.hasOwnProperty('text')) {
                pickIt(<ts.QualifiedName> qn.left);
            } else {
                fqcn.unshift(qn.left['text']);
            }

            fqcn.push(qn.right.text);
        };

        pickIt(qn);

        return fqcn.join('.');
    }

    /** Serialize a signature (call or construct) */
    function serializeSignature(signature: ts.Signature) {
        return {
            parameters: signature.parameters.map(serializeSymbol),
            returnType: checker.typeToString(signature.getReturnType()),
            documentation: ts.displayPartsToString(signature.getDocumentationComment())
        };
    }

    /** True if this is visible outside this file, false otherwise */
    function isNodeExported(node: ts.Node): boolean {
        return (node.flags & ts.NodeFlags.ExportContext) !== 0 || (node.parent && node.parent.kind === ts.SyntaxKind.SourceFile);
    }
}

generateDocumentation(process.argv.slice(2), {
    target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS
});
