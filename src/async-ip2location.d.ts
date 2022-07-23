declare module 'async-ip2location' {
	interface QueryOK {
		ip: string;
		ip_no: string;
		isp: string;
		domain: string;
		timezone: string;
		netspeed: string;
		iddcode: string;
		areacode: string;
		weatherstationcode: string;
		weatherstationname: string;
		mcc: string;
		mnc: string;
		mobilebrand: string;
		elevation: string;
		usagetype: string;
		country_short: string;
		country_long: string;
		region: string;
		city: string;
		zipcode: string;
		latitude: number;
		longitude: number;
	}

	type Query =
		| (Partial<QueryOK> & { status: 'OK' })
		| { status: 'IP_ADDRESS_NOT_FOUND' };

	type IPType = 4 | 6 | number;

	class Database {
		constructor(fd: import('fs/promises').FileHandle);
		binfile: string;
		IPv4ColumnSize: number;
		IPv6ColumnSize: number;
		low: number;
		high: number;
		mid: number;
		IndexArrayIPv4: [Buffer, Buffer][];
		IndexArrayIPv6: [Buffer, Buffer][];
		country_pos_offset: number;
		region_pos_offset: number;
		city_pos_offset: number;
		isp_pos_offset: number;
		domain_pos_offset: number;
		zipcode_pos_offset: number;
		latitude_pos_offset: number;
		longitude_pos_offset: number;
		timezone_pos_offset: number;
		netspeed_pos_offset: number;
		iddcode_pos_offset: number;
		areacode_pos_offset: number;
		weatherstationcode_pos_offset: number;
		weatherstationname_pos_offset: number;
		mcc_pos_offset: number;
		mnc_pos_offset: number;
		mobilebrand_pos_offset: number;
		elevation_pos_offset: number;
		usagetype_pos_offset: number;
		country_enabled: boolean;
		region_enabled: boolean;
		city_enabled: boolean;
		isp_enabled: boolean;
		domain_enabled: boolean;
		zipcode_enabled: boolean;
		latitude_enabled: boolean;
		longitude_enabled: boolean;
		timezone_enabled: boolean;
		netspeed_enabled: boolean;
		iddcode_enabled: boolean;
		areacode_enabled: boolean;
		weatherstationcode_enabled: boolean;
		weatherstationname_enabled: boolean;
		mcc_enabled: boolean;
		mnc_enabled: boolean;
		mobilebrand_enabled: boolean;
		elevation_enabled: boolean;
		usagetype_enabled: boolean;
		mydb: {
			_DBType: number;
			_DBColumn: number;
			_DBYear: number;
			_DBMonth: number;
			_DBDay: number;
			_DBCount: number;
			_BaseAddr: number;
			_DBCountIPv6: number;
			_BaseAddrIPv6: number;
			_OldBIN: boolean;
			_Indexed: boolean;
			_IndexedIPv6: boolean;
			_IndexBaseAddr: number;
			_IndexBaseAddrIPv6: number;
		};
		close(): Promise<void>;
		readbin(
			readbytes: number,
			pos: number,
			readtype: 'int8',
			isbigint?: boolean
		): Promise<number>;
		readbin(
			readbytes: number,
			pos: number,
			readtype: 'int32',
			isbigint?: boolean
		): Promise<number>;
		readbin(
			readbytes: number,
			pos: number,
			readtype: 'uint32',
			isbigint?: boolean
		): Promise<number | bigint>;
		readbin(
			readbytes: number,
			pos: number,
			readtype: 'float',
			isbigint?: boolean
		): Promise<number>;
		readbin(
			readbytes: number,
			pos: number,
			readtype: 'str',
			isbigint?: boolean
		): Promise<string>;
		readbin(
			readbytes: number,
			pos: number,
			readtype: 'int128',
			isbigint?: boolean
		): Promise<bigint>;
		readbuffer(readbytes: number, pos: number): Promise<Buffer>;
		read8(pos: number): Promise<number>;
		read32(pos: number, isbigint?: boolean): Promise<number | bigint>;
		readfloat(pos: number): Promise<number>;
		read32or128(pos: number, iptype: IPType): Promise<number | bigint>;
		read128(pos: number): Promise<bigint>;
		readstr(pos: number): Promise<string>;
		query(myIP: string, iptype: IPType): Promise<Query>;
		get_all(myIP: string): Promise<Query>;
		get_country_short(
			myIP: string
		): Promise<QueryOK['country_short'] | undefined>;
		get_country_long(
			myIP: string
		): Promise<QueryOK['country_long'] | undefined>;
		get_region(myIP: string): Promise<QueryOK['region'] | undefined>;
		get_city(myIP: string): Promise<QueryOK['city'] | undefined>;
		get_isp(myIP: string): Promise<QueryOK['isp'] | undefined>;
		get_latitude(myIP: string): Promise<QueryOK['latitude'] | undefined>;
		get_longitude(myIP: string): Promise<QueryOK['longitude'] | undefined>;
		get_domain(myIP: string): Promise<QueryOK['domain'] | undefined>;
		get_zipcode(myIP: string): Promise<QueryOK['zipcode'] | undefined>;
		get_timezone(myIP: string): Promise<QueryOK['timezone'] | undefined>;
		get_netspeed(myIP: string): Promise<QueryOK['netspeed'] | undefined>;
		get_iddcode(myIP: string): Promise<QueryOK['iddcode'] | undefined>;
		get_areacode(myIP: string): Promise<QueryOK['areacode'] | undefined>;
		get_weatherstationcode(
			myIP: string
		): Promise<QueryOK['weatherstationcode'] | undefined>;
		get_weatherstationname(
			myIP: string
		): Promise<QueryOK['weatherstationname'] | undefined>;
		get_mcc(myIP: string): Promise<QueryOK['mcc'] | undefined>;
		get_mnc(myIP: string): Promise<QueryOK['mnc'] | undefined>;
		get_mobilebrand(myIP: string): Promise<QueryOK['mobilebrand'] | undefined>;
		get_elevation(myIP: string): Promise<QueryOK['elevation'] | undefined>;
		get_usagetype(myIP: string): Promise<QueryOK['usagetype'] | undefined>;
	}

	export default function (binfile: string): Promise<Database>;
}
