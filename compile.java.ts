import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";

const configFileName = path.resolve("test/tsconfig.json");
const configObject = JSON.parse(fs.readFileSync(configFileName));
const {fileNames, options} = ts.parseJsonConfigFileContent(configObject, ts.sys, path.dirname(configFileName));

console.log(fileNames);

const program = ts.createProgram(fileNames, options);
program.getSourceFiles().forEach(s => {
    if (s.fileName.substr(-5) === ".d.ts") {
        return;
    }

    console.log("Compile: " + s.fileName);
    compile(s);
});

function compile(node: ts.Node) {
    
    switch(node.kind) {
        // case ts.SyntaxKind.ClassDeclaration
        case ts.SyntaxKind.ImportDeclaration:
            const i = <ts.ImportDeclaration>node;
            // console.log("import " + i.importClause.name.text + " " + i.importClause.namedBindings + " " + (<ts.StringLiteral>i.moduleSpecifier).text);
            break;
        case ts.SyntaxKind.ClassDeclaration:
            let classDeclaration = <ts.ClassDeclaration>node;
            let heading = "class " + classDeclaration.name.text;
            if (classDeclaration.heritageClauses) {
                if (classDeclaration.heritageClauses[0].token === ts.SyntaxKind.ExtendsKeyword) {
                    heading += " extends ";
                    let baseClass = classDeclaration.heritageClauses[0].types[0];
                    // TODO: Resolve the type rather than the identifier string
                    heading += (<ts.Identifier>baseClass.expression).text;
                }
                let c = classDeclaration.heritageClauses[0];
            }
            heading += " {"
            console.log(heading);

            classDeclaration.members.forEach(compile);

            console.log("}");
            break;
        case ts.SyntaxKind.Constructor:
            let ctor = <ts.ConstructorDeclaration>node;
            // TODO: Pass down the class name...
            console.log("ctor() ");
            compile(ctor.body);
            break;
        case ts.SyntaxKind.Block:
            console.log("{");
            let block = <ts.Block>node;
            block.statements.forEach(compile); // TODO: ";" separated
            console.log("}");
            break;
        case ts.SyntaxKind.ExpressionStatement:
            let expr = <ts.ExpressionStatement>node;
            compile(expr.expression);
            break;
        case ts.SyntaxKind.CallExpression:
            let callExpr = <ts.CallExpression>node;
            compile(callExpr.expression);
            // console.log("<");
            // callExpr.typeArguments.forEach(compile)
            // console.log(">");
            console.log("(");
            callExpr.arguments.forEach(compile); // comma separated...
            console.log(")");
            break;
        case ts.SyntaxKind.PropertyAccessExpression:
            let propAcc = <ts.PropertyAccessExpression>node;
            compile(propAcc.expression);
            console.log(".");
            console.log(propAcc.name.text);
            break;
        case ts.SyntaxKind.SuperKeyword:
            console.log("super");
            break;
        case ts.SyntaxKind.Identifier:
            let identifier = <ts.Identifier>node;
            console.log(identifier.text);
            break;
        case ts.SyntaxKind.StringLiteral:
            console.log('"' + (<ts.StringLiteral>node).text + '"');
            break;
        case ts.SyntaxKind.SourceFile:
            ts.forEachChild(node, compile);
            // Perhaps start new source file...
            break;
        case ts.SyntaxKind.EndOfFileToken:
            console.log("EOF");
            break;
        default:
            console.log("Unsupported: " + node.pos + " " + ts.SyntaxKind[node.kind]); 
    }
}
