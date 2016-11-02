"use strict";
var ts = require("typescript");
var fs = require("fs");
var path = require("path");
var configFileName = path.resolve("test/tsconfig.json");
var configObject = JSON.parse(fs.readFileSync(configFileName));
var _a = ts.parseJsonConfigFileContent(configObject, ts.sys, path.dirname(configFileName)), fileNames = _a.fileNames, options = _a.options;
console.log(fileNames);
var program = ts.createProgram(fileNames, options);
program.getSourceFiles().forEach(function (s) {
    if (s.fileName.substr(-5) === ".d.ts") {
        return;
    }
    console.log("Compile: " + s.fileName);
    compile(s);
});
function compile(node) {
    switch (node.kind) {
        // case ts.SyntaxKind.ClassDeclaration
        case ts.SyntaxKind.ImportDeclaration:
            var i = node;
            // console.log("import " + i.importClause.name.text + " " + i.importClause.namedBindings + " " + (<ts.StringLiteral>i.moduleSpecifier).text);
            break;
        case ts.SyntaxKind.ClassDeclaration:
            var classDeclaration = node;
            var heading = "class " + classDeclaration.name.text;
            if (classDeclaration.heritageClauses) {
                if (classDeclaration.heritageClauses[0].token === ts.SyntaxKind.ExtendsKeyword) {
                    heading += " extends ";
                    var baseClass = classDeclaration.heritageClauses[0].types[0];
                    // TODO: Resolve the type rather than the identifier string
                    heading += baseClass.expression.text;
                }
                var c = classDeclaration.heritageClauses[0];
            }
            heading += " {";
            console.log(heading);
            classDeclaration.members.forEach(compile);
            console.log("}");
            break;
        case ts.SyntaxKind.Constructor:
            var ctor = node;
            // TODO: Pass down the class name...
            console.log("ctor() ");
            compile(ctor.body);
            break;
        case ts.SyntaxKind.Block:
            console.log("{");
            var block = node;
            block.statements.forEach(compile); // TODO: ";" separated
            console.log("}");
            break;
        case ts.SyntaxKind.ExpressionStatement:
            var expr = node;
            compile(expr.expression);
            break;
        case ts.SyntaxKind.CallExpression:
            var callExpr = node;
            compile(callExpr.expression);
            // console.log("<");
            // callExpr.typeArguments.forEach(compile)
            // console.log(">");
            console.log("(");
            callExpr.arguments.forEach(compile); // comma separated...
            console.log(")");
            break;
        case ts.SyntaxKind.PropertyAccessExpression:
            var propAcc = node;
            compile(propAcc.expression);
            console.log(".");
            console.log(propAcc.name.text);
            break;
        case ts.SyntaxKind.SuperKeyword:
            console.log("super");
            break;
        case ts.SyntaxKind.Identifier:
            var identifier = node;
            console.log(identifier.text);
            break;
        case ts.SyntaxKind.StringLiteral:
            console.log('"' + node.text + '"');
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
