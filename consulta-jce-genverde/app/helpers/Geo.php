<?php
/**
 * GenVerde · Geo (RD)
 * Mapea el municipio/ciudad que devuelve la JCE a su provincia, para
 * autocompletar el formulario de afiliación.
 */
class Geo
{
    /** municipio normalizado => provincia (string exacto de PROVINCIAS). */
    private const MUNICIPIOS = [
        // Distrito Nacional
        'SANTO DOMINGO' => 'Distrito Nacional',
        'SANTO DOMINGO DE GUZMAN' => 'Distrito Nacional',
        'DISTRITO NACIONAL' => 'Distrito Nacional',
        // Santo Domingo (provincia)
        'SANTO DOMINGO ESTE' => 'Santo Domingo',
        'SANTO DOMINGO NORTE' => 'Santo Domingo',
        'SANTO DOMINGO OESTE' => 'Santo Domingo',
        'BOCA CHICA' => 'Santo Domingo',
        'LOS ALCARRIZOS' => 'Santo Domingo',
        'PEDRO BRAND' => 'Santo Domingo',
        'SAN ANTONIO DE GUERRA' => 'Santo Domingo',
        'GUERRA' => 'Santo Domingo',
        // Azua
        'AZUA' => 'Azua', 'LAS CHARCAS' => 'Azua', 'LAS YAYAS DE VIAJAMA' => 'Azua',
        'PADRE LAS CASAS' => 'Azua', 'PERALTA' => 'Azua', 'PUEBLO VIEJO' => 'Azua',
        'SABANA YEGUA' => 'Azua', 'ESTEBANIA' => 'Azua', 'GUAYABAL' => 'Azua', 'TABARA ARRIBA' => 'Azua',
        // Bahoruco
        'NEIBA' => 'Bahoruco', 'NEYBA' => 'Bahoruco', 'GALVAN' => 'Bahoruco', 'LOS RIOS' => 'Bahoruco',
        'TAMAYO' => 'Bahoruco', 'VILLA JARAGUA' => 'Bahoruco', 'EL PALMAR' => 'Bahoruco',
        // Barahona
        'BARAHONA' => 'Barahona', 'CABRAL' => 'Barahona', 'EL PENON' => 'Barahona', 'ENRIQUILLO' => 'Barahona',
        'FUNDACION' => 'Barahona', 'JAQUIMEYES' => 'Barahona', 'LA CIENAGA' => 'Barahona', 'LAS SALINAS' => 'Barahona',
        'PARAISO' => 'Barahona', 'POLO' => 'Barahona', 'VICENTE NOBLE' => 'Barahona',
        // Dajabón
        'DAJABON' => 'Dajabón', 'LOMA DE CABRERA' => 'Dajabón', 'PARTIDO' => 'Dajabón',
        'RESTAURACION' => 'Dajabón', 'EL PINO' => 'Dajabón',
        // Duarte
        'SAN FRANCISCO DE MACORIS' => 'Duarte', 'ARENOSO' => 'Duarte', 'CASTILLO' => 'Duarte',
        'EUGENIO MARIA DE HOSTOS' => 'Duarte', 'LAS GUARANAS' => 'Duarte', 'PIMENTEL' => 'Duarte', 'VILLA RIVA' => 'Duarte',
        // Elías Piña
        'COMENDADOR' => 'Elías Piña', 'BANICA' => 'Elías Piña', 'EL LLANO' => 'Elías Piña',
        'HONDO VALLE' => 'Elías Piña', 'JUAN SANTIAGO' => 'Elías Piña', 'PEDRO SANTANA' => 'Elías Piña', 'ELIAS PINA' => 'Elías Piña',
        // El Seibo
        'EL SEIBO' => 'El Seibo', 'EL SEYBO' => 'El Seibo', 'MICHES' => 'El Seibo',
        // Espaillat
        'MOCA' => 'Espaillat', 'CAYETANO GERMOSEN' => 'Espaillat', 'GASPAR HERNANDEZ' => 'Espaillat', 'JAMAO AL NORTE' => 'Espaillat',
        // Hato Mayor
        'HATO MAYOR' => 'Hato Mayor', 'HATO MAYOR DEL REY' => 'Hato Mayor', 'EL VALLE' => 'Hato Mayor', 'SABANA DE LA MAR' => 'Hato Mayor',
        // Hermanas Mirabal
        'SALCEDO' => 'Hermanas Mirabal', 'TENARES' => 'Hermanas Mirabal', 'VILLA TAPIA' => 'Hermanas Mirabal',
        // Independencia
        'JIMANI' => 'Independencia', 'CRISTOBAL' => 'Independencia', 'DUVERGE' => 'Independencia',
        'LA DESCUBIERTA' => 'Independencia', 'MELLA' => 'Independencia', 'POSTRER RIO' => 'Independencia',
        // La Altagracia
        'HIGUEY' => 'La Altagracia', 'SALVALEON DE HIGUEY' => 'La Altagracia',
        'SAN RAFAEL DEL YUMA' => 'La Altagracia', 'LA ALTAGRACIA' => 'La Altagracia',
        // La Romana
        'LA ROMANA' => 'La Romana', 'GUAYMATE' => 'La Romana', 'VILLA HERMOSA' => 'La Romana',
        // La Vega
        'LA VEGA' => 'La Vega', 'CONCEPCION DE LA VEGA' => 'La Vega', 'CONSTANZA' => 'La Vega',
        'JARABACOA' => 'La Vega', 'JIMA ABAJO' => 'La Vega',
        // María Trinidad Sánchez
        'NAGUA' => 'María Trinidad Sánchez', 'CABRERA' => 'María Trinidad Sánchez',
        'EL FACTOR' => 'María Trinidad Sánchez', 'RIO SAN JUAN' => 'María Trinidad Sánchez',
        'MARIA TRINIDAD SANCHEZ' => 'María Trinidad Sánchez',
        // Monseñor Nouel
        'BONAO' => 'Monseñor Nouel', 'MAIMON' => 'Monseñor Nouel', 'PIEDRA BLANCA' => 'Monseñor Nouel', 'MONSENOR NOUEL' => 'Monseñor Nouel',
        // Monte Cristi
        'MONTE CRISTI' => 'Monte Cristi', 'MONTECRISTI' => 'Monte Cristi', 'SAN FERNANDO DE MONTE CRISTI' => 'Monte Cristi',
        'CASTANUELAS' => 'Monte Cristi', 'GUAYUBIN' => 'Monte Cristi', 'LAS MATAS DE SANTA CRUZ' => 'Monte Cristi',
        'PEPILLO SALCEDO' => 'Monte Cristi', 'VILLA VASQUEZ' => 'Monte Cristi',
        // Monte Plata
        'MONTE PLATA' => 'Monte Plata', 'BAYAGUANA' => 'Monte Plata', 'PERALVILLO' => 'Monte Plata',
        'SABANA GRANDE DE BOYA' => 'Monte Plata', 'YAMASA' => 'Monte Plata',
        // Pedernales
        'PEDERNALES' => 'Pedernales', 'OVIEDO' => 'Pedernales',
        // Peravia
        'BANI' => 'Peravia', 'NIZAO' => 'Peravia', 'MATANZAS' => 'Peravia', 'PERAVIA' => 'Peravia',
        // Puerto Plata
        'PUERTO PLATA' => 'Puerto Plata', 'SAN FELIPE DE PUERTO PLATA' => 'Puerto Plata', 'ALTAMIRA' => 'Puerto Plata',
        'GUANANICO' => 'Puerto Plata', 'IMBERT' => 'Puerto Plata', 'LOS HIDALGOS' => 'Puerto Plata',
        'LUPERON' => 'Puerto Plata', 'SOSUA' => 'Puerto Plata', 'VILLA ISABELA' => 'Puerto Plata', 'VILLA MONTELLANO' => 'Puerto Plata',
        // Samaná
        'SAMANA' => 'Samaná', 'SANTA BARBARA DE SAMANA' => 'Samaná', 'LAS TERRENAS' => 'Samaná', 'SANCHEZ' => 'Samaná',
        // San Cristóbal
        'SAN CRISTOBAL' => 'San Cristóbal', 'BAJOS DE HAINA' => 'San Cristóbal', 'HAINA' => 'San Cristóbal',
        'CAMBITA GARABITOS' => 'San Cristóbal', 'LOS CACAOS' => 'San Cristóbal', 'SABANA GRANDE DE PALENQUE' => 'San Cristóbal',
        'SAN GREGORIO DE NIGUA' => 'San Cristóbal', 'NIGUA' => 'San Cristóbal', 'VILLA ALTAGRACIA' => 'San Cristóbal', 'YAGUATE' => 'San Cristóbal',
        // San José de Ocoa
        'SAN JOSE DE OCOA' => 'San José de Ocoa', 'RANCHO ARRIBA' => 'San José de Ocoa', 'SABANA LARGA' => 'San José de Ocoa',
        // San Juan
        'SAN JUAN' => 'San Juan', 'SAN JUAN DE LA MAGUANA' => 'San Juan', 'BOHECHIO' => 'San Juan',
        'EL CERCADO' => 'San Juan', 'JUAN DE HERRERA' => 'San Juan', 'LAS MATAS DE FARFAN' => 'San Juan', 'VALLEJUELO' => 'San Juan',
        // San Pedro de Macorís
        'SAN PEDRO DE MACORIS' => 'San Pedro de Macorís', 'CONSUELO' => 'San Pedro de Macorís', 'GUAYACANES' => 'San Pedro de Macorís',
        'QUISQUEYA' => 'San Pedro de Macorís', 'RAMON SANTANA' => 'San Pedro de Macorís', 'LOS LLANOS' => 'San Pedro de Macorís',
        // Sánchez Ramírez
        'COTUI' => 'Sánchez Ramírez', 'CEVICOS' => 'Sánchez Ramírez', 'FANTINO' => 'Sánchez Ramírez',
        'LA MATA' => 'Sánchez Ramírez', 'SANCHEZ RAMIREZ' => 'Sánchez Ramírez',
        // Santiago
        'SANTIAGO' => 'Santiago', 'SANTIAGO DE LOS CABALLEROS' => 'Santiago', 'BISONO' => 'Santiago', 'VILLA BISONO' => 'Santiago',
        'NAVARRETE' => 'Santiago', 'JANICO' => 'Santiago', 'LICEY AL MEDIO' => 'Santiago', 'PUNAL' => 'Santiago',
        'SABANA IGLESIA' => 'Santiago', 'SAN JOSE DE LAS MATAS' => 'Santiago', 'TAMBORIL' => 'Santiago', 'VILLA GONZALEZ' => 'Santiago',
        // Santiago Rodríguez
        'SAN IGNACIO DE SABANETA' => 'Santiago Rodríguez', 'SABANETA' => 'Santiago Rodríguez',
        'LOS ALMACIGOS' => 'Santiago Rodríguez', 'MONCION' => 'Santiago Rodríguez', 'SANTIAGO RODRIGUEZ' => 'Santiago Rodríguez',
        // Valverde
        'MAO' => 'Valverde', 'VALVERDE' => 'Valverde', 'ESPERANZA' => 'Valverde', 'LAGUNA SALADA' => 'Valverde',
    ];

    /** Devuelve la provincia (exacta) para una ciudad/municipio JCE, o null. */
    public static function provinciaDeCiudad(?string $ciudad): ?string
    {
        $key = self::normalizar((string) $ciudad);
        if ($key === '') {
            return null;
        }
        if (isset(self::MUNICIPIOS[$key])) {
            return self::MUNICIPIOS[$key];
        }
        // Coincidencia directa con el nombre de una provincia.
        foreach (PROVINCIAS as $prov) {
            if (self::normalizar($prov) === $key) {
                return $prov;
            }
        }
        return null;
    }

    public static function normalizar(string $s): string
    {
        // Reemplazo explícito de acentos/diéresis (determinista en cualquier SO).
        $acentos = [
            'á'=>'A','é'=>'E','í'=>'I','ó'=>'O','ú'=>'U','ü'=>'U','ñ'=>'N',
            'Á'=>'A','É'=>'E','Í'=>'I','Ó'=>'O','Ú'=>'U','Ü'=>'U','Ñ'=>'N',
            'à'=>'A','è'=>'E','ì'=>'I','ò'=>'O','ù'=>'U',
        ];
        $s = strtr(trim($s), $acentos);
        $s = strtoupper($s);
        $s = preg_replace('/[^A-Z0-9 ]/', ' ', $s);
        $s = preg_replace('/\s+/', ' ', $s);
        return trim($s);
    }
}
