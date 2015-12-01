<?php

namespace Fuga\CommonBundle\Model;

class ParamManager extends ModelManager
{
	protected $entityTable = 'config_param';

	public function findAll($name) {
		$sql = "SELECT * FROM config_param WHERE module= :name ";
		$stmt = $this->get('connection')->prepare($sql);
		$stmt->bindValue("name", $name);
		$stmt->execute();

		return $stmt->fetchAll();
	}

	public function findByName($module, $name) {
		$sql = "SELECT * FROM config_param WHERE module= :module AND name= :name";
		$stmt = $this->get('connection')->prepare($sql);
		$stmt->bindValue("module", $module);
		$stmt->bindValue("name", $name);
		$stmt->execute();
		$param = $stmt->fetch();

		return $param ? $param['value'] : null;
	}

	public function validate($value, $param = array())
	{
		$ret = null;

		switch ($param['type']) {
			case 'boolean':
				if (intval($value) >= intval($param['minvalue']) && intval($value) <= intval($param['maxvalue'])) {
					$ret = intval($value);
				} else {
					$ret = intval($param['defaultvalue']);
				}
				break;
			case 'integer':
				if (intval($value) >= intval($param['minvalue']) && intval($value) <= intval($param['maxvalue'])) {
					$ret = intval($value);
				} else {
					$ret = intval($param['defaultvalue']);
				}
				break;
			default:
				$ret = $value;
		}

		return $ret;
	}
}