export namespace pepe.core
{
    export class CoreCitizen
    {
        public static hello()
        {
            console.log('HI!');
        }

        public static makeError()
        {
            throw new Error();
        }
    }
}
