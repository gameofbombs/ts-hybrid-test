export namespace pepe.core
{
    export class CoreCitizen
    {

    }
}

export namespace pepe
{
    export class A
    {

    }
}

import CoreCitizen = pepe.core.CoreCitizen;

export namespace pepe
{
    export class B extends CoreCitizen
    {

    }
}

export namespace nope
{
    export class Nope extends pepe.core.CoreCitizen
    {

    }
}

export namespace pepe
{
    export class C extends B
    {

    }
}
