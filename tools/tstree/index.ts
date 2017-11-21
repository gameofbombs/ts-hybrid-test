#!/usr/bin/env node
import * as ts from "typescript";
import * as glob from "glob";
import * as fs from 'fs';

const bundleName = process.argv.slice(3).toString();
const bundleNameTs = bundleName.replace('.js', '.ts');
const sourcesDir = process.argv.slice(2, -1).toString();

interface MetadataDictionary
{
    [id: string]: MetadataEntry;
}

interface MetadataEntry
{
    name?: string;
    fileName?: string;
    moduleName?: string;
    parentClass?: string;
    children: MetadataDictionary;
    text: string;
}

/** Generate documentation for all classes in a set of .ts files */
function generateClassMetadata(fileNames: string[], options: ts.CompilerOptions): MetadataDictionary
{
    // Build a program using the set of root file names in fileNames
    let program = ts.createProgram(fileNames, options);

    // Get the checker, we will use it to find more about classes
    let checker = program.getTypeChecker();

    let output: MetadataDictionary = {};

    // Visit every sourceFile in the program
    for (const sourceFile of program.getSourceFiles()) {
        // Walk the tree to search for classes
        ts.forEachChild(sourceFile, visit);
    }

    return output;

    /** visit nodes finding exported classes */
    function visit(node: ts.Node)
    {
        const path = node.getSourceFile()['path'].toString();

        if (path.includes('node_modules') || !path.includes(sourcesDir)) {
            return;
        }

        if (node.kind === ts.SyntaxKind.ClassDeclaration) {
            // This is a top level class, get its symbol
            let symbol = checker.getSymbolAtLocation((<ts.ClassDeclaration>node).name);
            let classMetadata = serializeClass(symbol);

            classMetadata.text = node.getSourceFile().text;

            const classFqcn = getFqcnBySymbol(symbol);
            classMetadata.moduleName = classFqcn.join('.');

            if ((<ts.ClassDeclaration>node).heritageClauses) {
                for (let heritage of (<ts.ClassDeclaration>node).heritageClauses) {
                    if (heritage.token === ts.SyntaxKind.ExtendsKeyword) {

                        let identifier;

                        if (heritage) {
                            identifier = heritage.types[0].expression;
                        }

                        let heritageSymbol = checker.getSymbolAtLocation(identifier);

                        if (!heritageSymbol) {
                            if (identifier.kind === ts.SyntaxKind.Identifier) {
                                classMetadata.parentClass = classFqcn.slice(0, -1).join('.') + '.' + identifier.text;
                            } else {
                                classMetadata.parentClass = getFqcnByPropertyAccess(identifier);
                            }
                        } else {
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
    function serializeClass(symbol: ts.Symbol): MetadataEntry
    {
        return {
            name: symbol.getName(),
            text: '',
            children: {}
        };
    }

    function getFqcnBySymbol(symbol: ts.Symbol): string[]
    {
        let fqcn = [];
        let previous = symbol;

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

    function getFqcnByPropertyAccess(property: ts.PropertyAccessExpression)
    {
        let fqcn = [];

        const pickIt = (qn: ts.PropertyAccessExpression) => {
            if (qn.hasOwnProperty('expression')) {
                pickIt(<ts.PropertyAccessExpression> qn.expression);
            } else {
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


const globInstance = new glob.GlobSync(sourcesDir + '/**/*.ts');

const metadata = generateClassMetadata(globInstance.found, {
    target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.CommonJS
});

function hasChildren(moduleNameSearch, metadata: MetadataDictionary)
{
    for (let moduleName in metadata) {
        const entry = metadata[moduleName];

        if (entry.parentClass === moduleNameSearch) {
            return true;
        }
    }

    return false;
}

function unflattenMetadata(metadata: MetadataDictionary)
{
    for (let moduleName in metadata) {
        const entry = metadata[moduleName];

        if (!hasChildren(entry.moduleName, metadata)) {
            const parent = metadata[entry.parentClass];

            if (!parent) {
                continue;
            }

            parent.children[moduleName] = entry;
            delete metadata[moduleName];

            unflattenMetadata(metadata);
        }
    }
}

function concatSources(metadata: MetadataDictionary)
{
    const data = [];

    for (let moduleName in metadata) {
        const entry = metadata[moduleName];

        data.push(entry.text);
        data.push(concatSources(entry.children));
    }

    return data.join('');
}

unflattenMetadata(metadata);

const sources = concatSources(metadata);
const transpiled = ts.transpileModule(sources, {
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
